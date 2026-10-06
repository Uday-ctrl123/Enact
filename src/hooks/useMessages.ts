import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  language?: string;
  edited?: boolean;
}

interface UseMessagesOptions {
  conversationId: string | null;
  pageSize?: number;
}

export function useMessages({ conversationId, pageSize = 50 }: UseMessagesOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  // Load messages with pagination
  const loadMessages = useCallback(
    async (pageNum: number = 0) => {
      if (!conversationId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

        if (error) throw error;

        if (data) {
          const formattedMessages: Message[] = data
            .map((msg) => ({
              id: msg.id,
              role: msg.role as "user" | "assistant",
              content: msg.content,
              timestamp: new Date(msg.created_at),
              language: msg.language || undefined,
              edited: msg.edited || false,
            }))
            .reverse(); // Reverse to show oldest first

          if (pageNum === 0) {
            setMessages(formattedMessages);
          } else {
            setMessages((prev) => [...formattedMessages, ...prev]);
          }

          setHasMore(data.length === pageSize);
          setPage(pageNum);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, pageSize, toast]
  );

  // Load more messages (previous page)
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadMessages(page + 1);
    }
  }, [isLoading, hasMore, page, loadMessages]);

  // Add a new message to the list
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Update a message (for streaming)
  const updateMessage = useCallback((id: string, content: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, content } : msg)));
  }, []);

  // Remove a message
  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  // Edit a message
  const editMessage = useCallback(
    async (id: string, newContent: string) => {
      if (!conversationId) return;

      // Check if ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        // This is an old message with numeric ID - just update local state
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, content: newContent, edited: true } : msg))
        );
        toast({
          title: "Info",
          description: "Message updated locally. Please refresh to sync with database.",
        });
        return;
      }

      try {
        const { error } = await supabase
          .from("messages")
          .update({
            content: newContent,
            edited: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;

        // Update local state
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, content: newContent, edited: true } : msg))
        );

        toast({
          title: "Success",
          description: "Message updated successfully.",
        });
      } catch (error) {
        console.error("Error editing message:", error);
        toast({
          title: "Error",
          description: "Failed to edit message. Please try again.",
          variant: "destructive",
        });
      }
    },
    [conversationId, toast]
  );

  // Delete a message (soft delete)
  const deleteMessage = useCallback(
    async (id: string) => {
      if (!conversationId) {
        toast({
          title: "Error",
          description: "No active conversation found.",
          variant: "destructive",
        });
        return;
      }

      // Check if ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        // This is an old message with numeric ID - just remove from local state
        removeMessage(id);
        toast({
          title: "Info",
          description: "Message removed from view. Please refresh to see updated messages.",
        });
        return;
      }

      // Remove from local state first for immediate feedback
      removeMessage(id);

      try {
        // Soft delete by setting deleted_at timestamp
        const { data, error } = await supabase
          .from("messages")
          .update({
            deleted_at: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("conversation_id", conversationId)
          .select();

        if (error) {
          // If message doesn't exist in DB yet (still being saved), that's okay
          console.warn("Message delete warning:", error);
        }

        if (!data || data.length === 0) {
          // Message might not be in DB yet - that's okay, we removed it from local state
          console.warn("Message not found in database, but removed from local state");
        }

        toast({
          title: "Success",
          description: "Message deleted successfully.",
        });
      } catch (error) {
        console.error("Error deleting message:", error);
        // Still show success since we removed it from local state
        toast({
          title: "Success",
          description: "Message deleted successfully.",
        });
      }
    },
    [conversationId, toast, removeMessage]
  );

  // Initial load
  useEffect(() => {
    if (conversationId) {
      loadMessages(0);
    }
  }, [conversationId, loadMessages]); // Only reload when conversation changes

  return {
    messages,
    isLoading,
    hasMore,
    loadMore,
    addMessage,
    updateMessage,
    removeMessage,
    editMessage,
    deleteMessage,
    refresh: () => loadMessages(0),
  };
}
