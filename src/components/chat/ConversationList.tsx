import { useState, useEffect } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationItem } from "./ConversationItem";
import { ConversationListSkeleton } from "./ChatSkeleton";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";

interface ConversationListProps {
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export const ConversationList = ({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    conversations,
    isLoading,
    hasMore,
    loadMore,
    deleteConversation,
    updateTitle,
    togglePin,
    searchConversations,
  } = useConversations({ userId: user?.id || null });

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchConversations(debouncedSearchQuery);
    } else {
      // Reload all conversations if search is cleared
      searchConversations("");
    }
  }, [debouncedSearchQuery, searchConversations]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex h-full flex-col border-r bg-muted/10">
      {/* Header */}
      <div className="space-y-3 border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button size="icon" variant="ghost" onClick={onNewConversation} title="New conversation">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {isLoading && conversations.length === 0 ? (
            <ConversationListSkeleton />
          ) : conversations.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">No conversations yet</p>
              <p className="mt-1 text-xs">Start a new chat to begin</p>
            </div>
          ) : (
            <>
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  id={conversation.id}
                  title={conversation.title}
                  lastMessage={conversation.last_message}
                  messageCount={conversation.message_count}
                  updatedAt={conversation.updated_at}
                  isPinned={conversation.is_pinned}
                  isActive={conversation.id === currentConversationId}
                  onSelect={onSelectConversation}
                  onDelete={deleteConversation}
                  onUpdateTitle={updateTitle}
                  onTogglePin={togglePin}
                />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMore}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
