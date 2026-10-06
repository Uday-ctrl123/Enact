import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock Supabase auth endpoints
  http.post("https://test.supabase.co/auth/v1/token", () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      user: {
        id: "mock-user-id",
        email: "test@example.com",
      },
    });
  }),

  // Mock Supabase functions
  http.post("https://test.supabase.co/functions/v1/legal-chat", () => {
    return HttpResponse.json({
      response: "Mock legal advice response",
    });
  }),

  http.post("https://test.supabase.co/functions/v1/generate-document", () => {
    return HttpResponse.json({
      document: "Mock generated document",
    });
  }),
];

export const server = setupServer(...handlers);