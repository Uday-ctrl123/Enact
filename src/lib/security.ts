// Security utilities and configurations

import { INPUT_LIMITS, SECURITY, RATE_LIMITS } from "./constants";

/**
 * Sanitize user input to prevent XSS attacks
 * Enhanced with comprehensive XSS prevention
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  return (
    input
      // Remove script tags and content FIRST
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove style tags and content
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      // Remove iframe tags and content
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      // Remove object/embed tags
      .replace(/<(object|embed)[^>]*>/gi, "")
      // Remove ALL HTML tags
      .replace(/<[^>]*>/g, "")
      // Remove javascript: protocol
      .replace(/javascript:/gi, "")
      .replace(/data:/gi, "")
      .replace(/vbscript:/gi, "")
      // Remove event handlers
      .replace(/on\w+\s*=/gi, "")
      // Encode special characters
      .replace(/[&<>"']/g, (char) => {
        const entities: Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#x27;",
        };
        return entities[char] || char;
      })
      .trim()
  );
}

/**
 * Validate input length to prevent buffer overflow
 */
export function validateInputLength(
  input: string,
  maxLength: number = INPUT_LIMITS.MAX_MESSAGE_LENGTH
): { valid: boolean; error?: string } {
  if (!input) return { valid: true };

  if (input.length > maxLength) {
    return {
      valid: false,
      error: `Input exceeds maximum length of ${maxLength} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate and sanitize URLs
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol");
    }

    return parsedUrl.toString();
  } catch {
    return "";
  }
}

/**
 * Generate CSP nonce for inline scripts
 */
export function generateCSPNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Content Security Policy configuration
 * Note: 'unsafe-inline' and 'unsafe-eval' are only for development
 * In production builds, these should be removed
 */
export const getCSPConfig = (nonce?: string) => {
  const isDev = import.meta.env.DEV;

  return {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      ...(isDev ? ["'unsafe-inline'", "'unsafe-eval'"] : []), // Only in development
      "https://fonts.googleapis.com",
      "https://www.googletagmanager.com",
    ],
    "style-src": [
      "'self'",
      "'unsafe-inline'", // Required for styled components
      "https://fonts.googleapis.com",
    ],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "img-src": ["'self'", "data:", "https:"],
    "connect-src": ["'self'", "https://*.supabase.co", "https://generativelanguage.googleapis.com"],
    "frame-ancestors": ["'none'"],
  };
};

// Export static config for backwards compatibility
export const CSP_CONFIG = getCSPConfig();

/**
 * Rate limiting for API calls
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = RATE_LIMITS.REQUESTS_PER_MINUTE,
    private windowMs: number = RATE_LIMITS.WINDOW_MS
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  getRemainingRequests(identifier: string): number {
    const requests = this.requests.get(identifier) || [];
    const now = Date.now();
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

/**
 * Session storage wrapper with Web Crypto API encryption
 * Note: This provides encryption at rest in sessionStorage, but keys are still in memory
 * For truly sensitive data, consider server-side storage only
 */
export class SecureStorage {
  private static readonly ENCRYPTION_KEY_NAME = "app_encryption_key";

  private static async getOrCreateKey(): Promise<CryptoKey> {
    // Try to get existing key from sessionStorage
    const storedKey = sessionStorage.getItem(this.ENCRYPTION_KEY_NAME);

    if (storedKey) {
      try {
        const keyData = JSON.parse(storedKey);
        return await crypto.subtle.importKey(
          "jwk",
          keyData,
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );
      } catch {
        // If import fails, generate new key
      }
    }

    // Generate new key
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
      "encrypt",
      "decrypt",
    ]);

    // Store key for session
    const exportedKey = await crypto.subtle.exportKey("jwk", key);
    sessionStorage.setItem(this.ENCRYPTION_KEY_NAME, JSON.stringify(exportedKey));

    return key;
  }

  private static async encrypt(data: string): Promise<string> {
    const key = await this.getOrCreateKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encryptedData = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encodedData);

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  }

  private static async decrypt(encryptedData: string): Promise<string> {
    const key = await this.getOrCreateKey();
    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedData = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);

    return new TextDecoder().decode(decryptedData);
  }

  static async setItem(key: string, value: string): Promise<void> {
    try {
      const encrypted = await this.encrypt(value);
      sessionStorage.setItem(key, encrypted);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to store data securely:", error);
      }
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;

      return await this.decrypt(encrypted);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to retrieve data securely:", error);
      }
      return null;
    }
  }

  static removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  static clear(): void {
    sessionStorage.clear();
  }
}

/**
 * Generate a cryptographically secure CSRF token
 * Exported for testing
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate CSRF token
 * Exported for testing
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = sessionStorage.getItem("csrf_token");
  return storedToken === token && token.length === SECURITY.CSRF_TOKEN_LENGTH;
}

/**
 * CSRF Token Management
 */
export class CSRFProtection {
  private static readonly TOKEN_KEY = "csrf_token";
  private static readonly TOKEN_HEADER = "X-CSRF-Token";

  /**
   * Generate a cryptographically secure CSRF token
   */
  static generateToken(): string {
    return generateCSRFToken();
  }

  /**
   * Get or create CSRF token
   */
  static getToken(): string {
    let token = sessionStorage.getItem(this.TOKEN_KEY);

    if (!token) {
      token = this.generateToken();
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }

    return token;
  }

  /**
   * Validate CSRF token
   */
  static validateToken(token: string): boolean {
    return validateCSRFToken(token);
  }

  /**
   * Add CSRF token to request headers
   */
  static addTokenToHeaders(headers: HeadersInit = {}): HeadersInit {
    return {
      ...headers,
      [this.TOKEN_HEADER]: this.getToken(),
    };
  }

  /**
   * Rotate CSRF token (call after sensitive operations)
   */
  static rotateToken(): string {
    const newToken = this.generateToken();
    sessionStorage.setItem(this.TOKEN_KEY, newToken);
    return newToken;
  }
}

/**
 * Secure logging utility that redacts sensitive information
 */
export class SecureLogger {
  private static readonly SENSITIVE_PATTERNS = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
    /\b\d{10,12}\b/g, // Phone numbers
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit cards
    /\b[A-Z]{2}\d{2}[A-Z0-9]{13,}\b/g, // IBAN
    /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/gi, // Bearer tokens
    /\b(password|pwd|secret|token|key)\s*[:=]\s*['"]?[^'"\s]+['"]?/gi, // Credentials
  ];

  /**
   * Redact sensitive data from message
   * Public for testing purposes
   */
  static redactSensitiveData(message: string): string {
    let redacted = message;

    this.SENSITIVE_PATTERNS.forEach((pattern) => {
      redacted = redacted.replace(pattern, "[REDACTED]");
    });

    return redacted;
  }

  static log(level: "info" | "warn" | "error", message: string, data?: unknown): void {
    if (import.meta.env.PROD) {
      // In production, only log errors and redact sensitive data
      if (level === "error") {
        const redactedMessage = this.redactSensitiveData(message);
        console.error(redactedMessage, data ? this.redactSensitiveData(JSON.stringify(data)) : "");
      }
    } else {
      // In development, log everything
      const logFn =
        level === "error" ? console.error : level === "warn" ? console.warn : console.log;
      logFn(message, data || "");
    }
  }
}
