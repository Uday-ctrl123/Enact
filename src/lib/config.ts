/**
 * Runtime configuration management
 * Provides secure access to configuration without exposing sensitive data
 */

import { env } from "./env";
import { INPUT_LIMITS, RATE_LIMITS } from "./constants";

interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  features: {
    analytics: boolean;
    errorTracking: boolean;
    pwa: boolean;
  };
  limits: {
    maxMessageLength: number;
    rateLimit: {
      requests: number;
      windowMs: number;
    };
  };
  version: string;
  environment: string;
}

/**
 * Get public configuration
 * Only returns non-sensitive configuration
 */
export function getPublicConfig(): AppConfig {
  return {
    supabase: {
      url: env.VITE_SUPABASE_URL,
      anonKey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    features: {
      analytics: !!env.VITE_ANALYTICS_ID,
      errorTracking: !!env.VITE_SENTRY_DSN,
      pwa: true,
    },
    limits: {
      maxMessageLength: INPUT_LIMITS.MAX_MESSAGE_LENGTH,
      rateLimit: {
        requests: RATE_LIMITS.REQUESTS_PER_MINUTE,
        windowMs: RATE_LIMITS.WINDOW_MS,
      },
    },
    version: env.VITE_APP_VERSION || "1.0.0",
    environment: env.MODE || "production",
  };
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return env.MODE === "development" || env.DEV === true;
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return env.MODE === "production" || env.PROD === true;
}

/**
 * Get feature flag value
 */
export function isFeatureEnabled(feature: keyof AppConfig["features"]): boolean {
  const config = getPublicConfig();
  return config.features[feature];
}

/**
 * Validate configuration on startup
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required Supabase config
  if (!env.VITE_SUPABASE_URL) {
    errors.push("VITE_SUPABASE_URL is required");
  }

  if (!env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    errors.push("VITE_SUPABASE_PUBLISHABLE_KEY is required");
  }

  // Warn about missing optional config
  if (!env.VITE_SENTRY_DSN && isProduction()) {
    console.warn("⚠️ VITE_SENTRY_DSN not configured - error tracking disabled");
  }

  if (!env.VITE_ANALYTICS_ID && isProduction()) {
    console.warn("⚠️ VITE_ANALYTICS_ID not configured - analytics disabled");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log configuration status (safe for production)
 */
export function logConfigStatus(): void {
  if (isDevelopment()) {
    console.log("🔧 Configuration Status:");
    console.log("  Environment:", env.MODE);
    console.log("  Supabase URL:", env.VITE_SUPABASE_URL);
    console.log("  Analytics:", isFeatureEnabled("analytics") ? "✅" : "❌");
    console.log("  Error Tracking:", isFeatureEnabled("errorTracking") ? "✅" : "❌");
    console.log("  PWA:", isFeatureEnabled("pwa") ? "✅" : "❌");
  }
}
