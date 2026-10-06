import { describe, it, expect } from "vitest";
import { env } from "../env";

describe("Environment Validation", () => {
  it("should have required environment variables", () => {
    // Test that env object exists and has required properties
    expect(env).toBeDefined();
    expect(env.VITE_SUPABASE_PROJECT_ID).toBeDefined();
    expect(env.VITE_SUPABASE_PUBLISHABLE_KEY).toBeDefined();
    expect(env.VITE_SUPABASE_URL).toBeDefined();
  });

  it("should have valid Supabase URL format", () => {
    expect(env.VITE_SUPABASE_URL).toMatch(/^https?:\/\//);
    expect(
      env.VITE_SUPABASE_URL.includes("supabase.co") || env.VITE_SUPABASE_URL.includes("localhost")
    ).toBe(true);
  });
});
