import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_PROJECT_ID: z.string().min(1, "VITE_SUPABASE_PROJECT_ID is required"),
  VITE_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "VITE_SUPABASE_PUBLISHABLE_KEY is required")
    .refine(
      (key) => key.startsWith("eyJ") || key.startsWith("sb_publishable_"),
      "VITE_SUPABASE_PUBLISHABLE_KEY must be a valid JWT or Supabase publishable key"
    ),
  VITE_SUPABASE_URL: z
    .string()
    .url("VITE_SUPABASE_URL must be a valid URL")
    .refine((url) => url.includes("supabase.co") || url.includes("localhost"), {
      message: "VITE_SUPABASE_URL must be a Supabase URL",
    }),
  VITE_ANALYTICS_ID: z.string().optional(),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_GEMINI_API_KEY: z.string().optional(),
  VITE_OPENROUTER_API_KEY: z.string().optional(),
  VITE_GROQ_API_KEY: z.string().optional(),
  VITE_SENTRY_DEBUG: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  VITE_APP_VERSION: z.string().optional(),
  MODE: z.enum(["development", "production", "test"]).optional(),
  DEV: z.boolean().optional(),
  PROD: z.boolean().optional(),
});

function validateEnv() {
  try {
    const parsed = envSchema.parse(import.meta.env);

    // Warn if using demo/placeholder values
    if (
      parsed.VITE_SUPABASE_PROJECT_ID === "demo" ||
      parsed.VITE_SUPABASE_PUBLISHABLE_KEY === "demo" ||
      parsed.VITE_SUPABASE_URL === "https://demo.supabase.co"
    ) {
      console.warn(
        "⚠️ Warning: Using demo Supabase credentials. Please configure proper environment variables."
      );
    }

    return parsed;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("❌ Environment validation failed:", error);
    }
    throw new Error("Invalid environment configuration. Please check your .env file.");
  }
}

// Runtime check to prevent accidental secret exposure
const FORBIDDEN_PATTERNS = ["SECRET", "PRIVATE", "PASSWORD", "API_KEY", "SERVICE_ROLE"];
Object.keys(import.meta.env).forEach((key) => {
  if (key.startsWith("VITE_")) {
    FORBIDDEN_PATTERNS.forEach((pattern) => {
      if (
        key.includes(pattern) &&
        key !== "VITE_SUPABASE_PUBLISHABLE_KEY" &&
        key !== "VITE_GEMINI_API_KEY" &&
        key !== "VITE_OPENROUTER_API_KEY" &&
        key !== "VITE_GROQ_API_KEY"
      ) {
        throw new Error(
          `Security Error: ${key} should not use VITE_ prefix. Sensitive data will be exposed in client bundle!`
        );
      }
    });
  }
});

export const env = validateEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
