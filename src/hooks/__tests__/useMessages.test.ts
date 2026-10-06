import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useMessages } from "../useMessages";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("useMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty messages", () => {
    const { result } = renderHook(() => useMessages({ conversationId: null, pageSize: 50 }));

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasMore).toBe(true);
  });

  it("should load messages when conversationId is provided", async () => {
    const mockMessages = [
      {
        id: "1",
        role: "user",
        content: "Hello",
        created_at: new Date().toISOString(),
        deleted_at: null,
        edited: false,
      },
    ];

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({
                data: mockMessages,
                error: null,
              }),
            }),
          }),
        }),
      }),
    });

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    const { result } = renderHook(() => useMessages({ conversationId: "test-id", pageSize: 50 }));

    await waitFor(() => {
      expect(result.current.messages.length).toBe(1);
    });

    expect(result.current.messages[0].content).toBe("Hello");
  });

  it("should add a new message", () => {
    const { result } = renderHook(() => useMessages({ conversationId: "test-id", pageSize: 50 }));

    const newMessage = {
      id: "2",
      role: "assistant" as const,
      content: "Hi there!",
      timestamp: new Date(),
    };

    act(() => {
      result.current.addMessage(newMessage);
    });

    expect(result.current.messages).toContainEqual(newMessage);
  });

  it("should update a message", () => {
    const { result } = renderHook(() => useMessages({ conversationId: "test-id", pageSize: 50 }));

    const message = {
      id: "1",
      role: "user" as const,
      content: "Hello",
      timestamp: new Date(),
    };

    act(() => {
      result.current.addMessage(message);
    });

    act(() => {
      result.current.updateMessage("1", "Hello World");
    });

    expect(result.current.messages[0].content).toBe("Hello World");
  });

  it("should remove a message", () => {
    const { result } = renderHook(() => useMessages({ conversationId: "test-id", pageSize: 50 }));

    const message = {
      id: "1",
      role: "user" as const,
      content: "Hello",
      timestamp: new Date(),
    };

    act(() => {
      result.current.addMessage(message);
    });

    act(() => {
      result.current.removeMessage("1");
    });

    expect(result.current.messages).toHaveLength(0);
  });
});
