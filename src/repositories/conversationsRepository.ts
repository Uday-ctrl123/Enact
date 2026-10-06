/**
 * Conversations Repository
 * Abstracts database operations for conversations
 * Implements repository pattern for better separation of concerns
 */

import { supabase } from "@/integrations/supabase/client";
import { PAGINATION } from "@/lib/constants";

export interface Conversation {
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

export class ConversationsRepository {
  /**
   * Load conversations with pagination
   */
  async loadConversations(
    userId: string,
    page: number = 0,
    pageSize: number = PAGINATION.CONVERSATIONS_PAGE_SIZE
  ): Promise<{ data: Conversation[]; hasMore: boolean; error?: Error }> {
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
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;

      const formattedConversations: Conversation[] = ((data as ConversationData[]) || []).map(
        (conv) => ({
          id: conv.id,
          title: conv.title,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          message_count: conv.messages?.length || 0,
          last_message: conv.messages?.[0]?.content?.substring(0, 100) || "",
        })
      );

      return {
        data: formattedConversations,
        hasMore: data ? data.length === pageSize : false,
      };
    } catch (error) {
      return {
        data: [],
        hasMore: false,
        error: error as Error,
      };
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<{ error?: Error }> {
    try {
      const { error } = await supabase.from("conversations").delete().eq("id", conversationId);

      if (error) throw error;

      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Update conversation title
   */
  async updateTitle(conversationId: string, newTitle: string): Promise<{ error?: Error }> {
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      if (error) throw error;

      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Toggle pin status
   */
  async togglePin(conversationId: string, isPinned: boolean): Promise<{ error?: Error }> {
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ is_pinned: !isPinned, updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      if (error) throw error;

      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Search conversations
   */
  async searchConversations(
    userId: string,
    query: string
  ): Promise<{ data: Conversation[]; error?: Error }> {
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

      const formattedConversations: Conversation[] = ((data as ConversationData[]) || []).map(
        (conv) => ({
          id: conv.id,
          title: conv.title,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          message_count: conv.messages?.length || 0,
          last_message: conv.messages?.[0]?.content?.substring(0, 100) || "",
        })
      );

      return { data: formattedConversations };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }
}

// Export singleton instance
export const conversationsRepository = new ConversationsRepository();
