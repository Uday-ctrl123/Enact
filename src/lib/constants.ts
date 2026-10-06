/**
 * Application-wide constants
 * Centralized configuration values to avoid magic numbers
 */

// Pagination
export const PAGINATION = {
  CONVERSATIONS_PAGE_SIZE: 20,
  MESSAGES_PAGE_SIZE: 50,
  DEFAULT_PAGE_SIZE: 20,
} as const;

// Input Validation
export const INPUT_LIMITS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_TITLE_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
} as const;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  API_REQUEST_SENSITIVE: 10000, // 10 seconds for auth operations
  DEBOUNCE_SEARCH: 300, // 300ms
  THROTTLE_SCROLL: 100, // 100ms
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 10,
  WINDOW_MS: 60000, // 1 minute
} as const;

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 10000, // 10 seconds
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  GC_TIME: 10 * 60 * 1000, // 10 minutes
} as const;

// Security
export const SECURITY = {
  CSRF_TOKEN_LENGTH: 64,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  ENCRYPTION_KEY_SIZE: 256,
} as const;

// Performance
export const PERFORMANCE = {
  VIRTUAL_SCROLL_ITEM_SIZE: 100,
  BUNDLE_SIZE_WARNING_KB: 1000,
  IMAGE_LAZY_LOAD_THRESHOLD: 200, // pixels
} as const;

// Feature Flags (can be overridden by env vars)
export const FEATURES = {
  ENABLE_VOICE_INPUT: true,
  ENABLE_CONVERSATION_EXPORT: true,
  ENABLE_DARK_MODE: true,
  ENABLE_PWA: true,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: "/health",
  VERSION: "/version",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  AUTH_ERROR: "Authentication failed. Please try again.",
  RATE_LIMIT_ERROR: "Too many requests. Please try again later.",
  VALIDATION_ERROR: "Invalid input. Please check your data.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CONVERSATION_DELETED: "Conversation deleted successfully.",
  CONVERSATION_UPDATED: "Conversation updated successfully.",
  MESSAGE_SENT: "Message sent successfully.",
  SETTINGS_SAVED: "Settings saved successfully.",
} as const;
