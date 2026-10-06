import { http, HttpResponse } from "msw";
import { env } from "@/lib/env";

const MOCK_USER = {
  id: "mock-user-123",
  email: "test@example.com",
  user_metadata: {
    full_name: "Test User",
  },
  app_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

const MOCK_SESSION = {
  access_token: "mock-jwt-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  user: MOCK_USER,
};

export const authHandlers = [
  // Sign In
  http.post(`${env.VITE_SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
    const url = new URL(request.url);
    const grantType = url.searchParams.get("grant_type");

    if (grantType === "password") {
      const body = await request.json() as any;
      console.log("MSW Intercepted Sign In:", body.email);
      
      return HttpResponse.json(MOCK_SESSION);
    }
    
    return HttpResponse.json(MOCK_SESSION);
  }),

  // Sign Up
  http.post(`${env.VITE_SUPABASE_URL}/auth/v1/signup`, async ({ request }) => {
    const body = await request.json() as any;
    console.log("MSW Intercepted Sign Up:", body.email);
    
    return HttpResponse.json({
      ...MOCK_USER,
      email: body.email,
      user_metadata: body.options?.data || MOCK_USER.user_metadata,
    });
  }),

  // Get User
  http.get(`${env.VITE_SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json(MOCK_USER);
  }),

  // Log Out
  http.post(`${env.VITE_SUPABASE_URL}/auth/v1/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Get Session
  http.get(`${env.VITE_SUPABASE_URL}/auth/v1/session`, () => {
    return HttpResponse.json({ session: MOCK_SESSION });
  }),

  // Mock Conversations Table
  http.post(`${env.VITE_SUPABASE_URL}/rest/v1/conversations`, () => {
    return HttpResponse.json({ id: crypto.randomUUID(), title: "Mock Conversation" }, { status: 201 });
  }),

  http.get(`${env.VITE_SUPABASE_URL}/rest/v1/conversations`, () => {
    return HttpResponse.json([]);
  }),

  // Mock Messages Table
  http.post(`${env.VITE_SUPABASE_URL}/rest/v1/messages`, () => {
    return HttpResponse.json({ id: crypto.randomUUID() }, { status: 201 });
  }),

  http.get(`${env.VITE_SUPABASE_URL}/rest/v1/messages`, () => {
    return HttpResponse.json([]);
  }),
];
