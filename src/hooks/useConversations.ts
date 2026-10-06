import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PAGINATION, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: string;
  is_pinned?: boolean;
}

interface ConversationData {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: Array<{
    id: string;
    content: string;
    created_at: string;
  }>;
}

interface UseConversationsOptions {
  userId: string | null;
  pageSize?: number;
}

export function useConversations({
  userId,
  pageSize = PAGINATION.CONVERSATIONS_PAGE_SIZE,
}: UseConversationsOptions) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  // Load conversations with pagination
  const loadConversations = useCallback(
    async (pageNum: number = 0) => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("conversations")
          .select(
            `
          id,
          title,
          created_at,
          updated_at,
          messages (
            id,
            content,
            created_at
          )
        `
          )
          .eq("user_id", userId)
          .is("deleted_at", null)
          .order("updated_at", { ascending: false })
          .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

        if (error) throw error;

        if (data) {
          const formattedConversations: Conversation[] = (data as ConversationData[]).map(
            (conv) => ({
              id: conv.id,
              title: conv.title,
              created_at: conv.created_at,
              updated_at: conv.updated_at,
              message_count: conv.messages?.length || 0,
              last_message: conv.messages?.[0]?.content?.substring(0, 100) || "",
            })
          );

          if (pageNum === 0) {
            setConversations(formattedConversations);
          } else {
            setConversations((prev) => [...prev, ...formattedConversations]);
          }

          setHasMore(data.length === pageSize);
          setPage(pageNum);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
        toast({
          title: "Error",
          description: ERROR_MESSAGES.GENERIC_ERROR,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [userId, pageSize, toast]
  );

  // Load more conversations
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadConversations(page + 1);
    }
  }, [isLoading, hasMore, page, loadConversations]);

  // Delete a conversation (hard delete for now)
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        // Delete conversation (this will cascade delete messages if FK is set up)
        const { error } = await supabase.from("conversations").delete().eq("id", conversationId);

        if (error) throw error;

        // Remove from local state
        setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));

        toast({
          title: "Success",
          description: SUCCESS_MESSAGES.CONVERSATION_DELETED,
        });
      } catch (error) {
        console.error("Error deleting conversation:", error);
        toast({
          title: "Error",
          description: "Failed to delete conversation. Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Update conversation title
  const updateTitle = useCallback(
    async (conversationId: string, newTitle: string) => {
      try {
        const { error } = await supabase
          .from("conversations")
          .update({ title: newTitle, updated_at: new Date().toISOString() })
          .eq("id", conversationId);

        if (error) throw error;

        // Update local state
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? { ...conv, title: newTitle, updated_at: new Date().toISOString() }
              : conv
          )
        );

        toast({
          title: "Success",
          description: SUCCESS_MESSAGES.CONVERSATION_UPDATED,
        });
      } catch (error) {
        console.error("Error updating title:", error);
        toast({
          title: "Error",
          description: "Failed to update title. Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Pin/Unpin conversation
  const togglePin = useCallback(
    async (conversationId: string, isPinned: boolean) => {
      try {
        const { error } = await supabase
          .from("conversations")
          .update({ is_pinned: !isPinned, updated_at: new Date().toISOString() })
          .eq("id", conversationId);

        if (error) throw error;

        // Update local state
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? { ...conv, is_pinned: !isPinned, updated_at: new Date().toISOString() }
              : conv
          )
        );

        toast({
          title: "Success",
          description: isPinned ? "Conversation unpinned." : "Conversation pinned.",
        });
      } catch (error) {
        console.error("Error toggling pin:", error);
        toast({
          title: "Error",
          description: "Failed to update conversation. Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Search conversations
  const searchConversations = useCallback(
    async (query: string) => {
      if (!userId || !query.trim()) {
        loadConversations(0);
        return;
      }

      setIsLoading(true);
      try {
        // Sanitize query to prevent SQL injection
        const sanitizedQuery = query.replace(/[%_]/g, "\\$&").trim();

        const { data, error } = await supabase
          .from("conversations")
          .select(
            `
          id,
          title,
          created_at,
          updated_at,
          messages (
            id,
            content,
            created_at
          )
        `
          )
          .eq("user_id", userId)
          .is("deleted_at", null)
          .or(`title.ilike.%${sanitizedQuery}%,messages.content.ilike.%${sanitizedQuery}%`)
          .order("updated_at", { ascending: false })
          .limit(20);

        if (error) throw error;

        if (data) {
          const formattedConversations: Conversation[] = (data as ConversationData[]).map(
            (conv) => ({
              id: conv.id,
              title: conv.title,
              created_at: conv.created_at,
              updated_at: conv.updated_at,
              message_count: conv.messages?.length || 0,
              last_message: conv.messages?.[0]?.content?.substring(0, 100) || "",
            })
          );

          setConversations(formattedConversations);
          setHasMore(false); // Search results don't paginate
        }
      } catch (error) {
        console.error("Error searching conversations:", error);
        toast({
          title: "Error",
          description: "Failed to search conversations. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [userId, toast, setConversations, setHasMore, loadConversations]
  );

  // Initial load
  useEffect(() => {
    if (userId) {
      loadConversations(0);
    }
  }, [userId, loadConversations]); // Only reload when user changes

  return {
    conversations,
    isLoading,
    hasMore,
    loadMore,
    deleteConversation,
    updateTitle,
    togglePin,
    searchConversations,
    refresh: () => loadConversations(0),
  };
}
