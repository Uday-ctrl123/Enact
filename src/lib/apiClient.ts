import { CSRFProtection, SecureLogger } from "./security";
import { RETRY_CONFIG, TIMEOUTS } from "./constants";
import { trackAPICall, captureException } from "./sentry";

interface RequestConfig extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
}

export class ApiClient {
  private baseUrl: string;
  private defaultRetries: number = RETRY_CONFIG.MAX_RETRIES;
  private defaultRetryDelay: number = RETRY_CONFIG.INITIAL_DELAY;
  private defaultTimeout: number = TIMEOUTS.API_REQUEST;
  private signingKey: CryptoKey | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.initializeSigningKey();
  }

  /**
   * Initialize signing key for request signatures
   */
  private async initializeSigningKey(): Promise<void> {
    try {
      // Generate or retrieve signing key
      const keyData = sessionStorage.getItem("api_signing_key");

      if (keyData) {
        this.signingKey = await crypto.subtle.importKey(
          "jwk",
          JSON.parse(keyData),
          { name: "HMAC", hash: "SHA-256" },
          true,
          ["sign", "verify"]
        );
      } else {
        this.signingKey = await crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-256" }, true, [
          "sign",
          "verify",
        ]);

        const exportedKey = await crypto.subtle.exportKey("jwk", this.signingKey);
        sessionStorage.setItem("api_signing_key", JSON.stringify(exportedKey));
      }
    } catch (error) {
      SecureLogger.log("error", "Failed to initialize signing key", error);
    }
  }

  /**
   * Sign request for integrity verification
   */
  private async signRequest(body: string, timestamp: string): Promise<string | null> {
    if (!this.signingKey) return null;

    try {
      const data = new TextEncoder().encode(body + timestamp);
      const signature = await crypto.subtle.sign("HMAC", this.signingKey, data);
      return btoa(String.fromCharCode(...new Uint8Array(signature)));
    } catch (error) {
      SecureLogger.log("error", "Failed to sign request", error);
      return null;
    }
  }

  /**
   * Exponential backoff delay calculation
   */
  private getRetryDelay(attempt: number, baseDelay: number): number {
    return baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: ApiError): boolean {
    // Retry on network errors
    if (!error.status) return true;

    // Retry on specific status codes
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }

  /**
   * Make HTTP request with retry logic
   */
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const {
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      timeout = this.defaultTimeout,
      headers = {},
      ...fetchConfig
    } = config;

    const url = `${this.baseUrl}${endpoint}`;
    let lastError: ApiError | null = null;
    const startTime = performance.now();

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Add CSRF token and request signature for state-changing operations
        let requestHeaders = headers;

        if (["POST", "PUT", "DELETE", "PATCH"].includes(fetchConfig.method || "GET")) {
          requestHeaders = CSRFProtection.addTokenToHeaders(headers);

          // Add request signature
          const timestamp = Date.now().toString();
          const body = fetchConfig.body ? String(fetchConfig.body) : "";
          const signature = await this.signRequest(body, timestamp);

          if (signature) {
            requestHeaders = {
              ...requestHeaders,
              "X-Signature": signature,
              "X-Timestamp": timestamp,
            };
          }
        }

        const response = await fetch(url, {
          ...fetchConfig,
          headers: {
            "Content-Type": "application/json",
            ...requestHeaders,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle non-2xx responses
        if (!response.ok) {
          const error: ApiError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;

          // Try to parse error response
          try {
            const errorData = await response.json();
            error.message = errorData.message || error.message;
            error.code = errorData.code;
          } catch {
            // Response is not JSON, use status text
          }

          throw error;
        }

        // Parse response
        const data = await response.json();

        const duration = performance.now() - startTime;
        SecureLogger.log("info", `API request successful: ${endpoint}`);
        trackAPICall(endpoint, duration, response.status);

        return data as T;
      } catch (error) {
        lastError = error as ApiError;

        // Don't retry on client errors (4xx except 408, 429)
        if (lastError.status && lastError.status >= 400 && lastError.status < 500) {
          if (![408, 429].includes(lastError.status)) {
            throw lastError;
          }
        }

        // Don't retry if not retryable or last attempt
        if (!this.isRetryableError(lastError) || attempt === retries) {
          const duration = performance.now() - startTime;
          SecureLogger.log("error", `API request failed: ${endpoint}`, lastError);
          trackAPICall(endpoint, duration, lastError.status || 0);
          captureException(lastError, { endpoint, attempt, duration });
          throw lastError;
        }

        // Wait before retrying
        const delay = this.getRetryDelay(attempt, retryDelay);
        SecureLogger.log(
          "warn",
          `Retrying request (attempt ${attempt + 1}/${retries}) after ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error("Request failed");
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

// Create API client instance
export const apiClient = new ApiClient(import.meta.env.VITE_SUPABASE_URL || "");
