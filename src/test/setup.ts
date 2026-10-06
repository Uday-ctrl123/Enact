import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Clean up after all tests are done
afterAll(() => server.close());

// Mock environment variables for tests
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_SUPABASE_PROJECT_ID: "test-project-id",
    VITE_SUPABASE_PUBLISHABLE_KEY: "test-key",
    VITE_SUPABASE_URL: "https://test.supabase.co",
  },
  writable: true,
});