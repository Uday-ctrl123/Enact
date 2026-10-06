import { MessageSquare, Trash2, Edit2, Check, X, Pin, Download, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, memo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportConversationAsJSON,
  exportConversationAsText,
  exportConversationAsMarkdown,
} from "@/utils/conversationExport";
import { useToast } from "@/hooks/use-toast";

interface ConversationItemProps {
  id: string;
  title: string;
  lastMessage?: string;
  messageCount?: number;
  updatedAt: string;
  isActive?: boolean;
  isPinned?: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
}

export const ConversationItem = memo(
  ({
    id,
    title,
    lastMessage,
    messageCount = 0,
    updatedAt,
    isActive = false,
    isPinned = false,
    onSelect,
    onDelete,
    onUpdateTitle,
    onTogglePin,
  }: ConversationItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const { toast } = useToast();

    const handleSaveTitle = () => {
      if (editedTitle.trim() && editedTitle !== title) {
        onUpdateTitle(id, editedTitle.trim());
      }
      setIsEditing(false);
    };

    const handleCancelEdit = () => {
      setEditedTitle(title);
      setIsEditing(false);
    };

    const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });

    const handleExport = async (format: "json" | "text" | "markdown") => {
      try {
        if (format === "json") {
          await exportConversationAsJSON(id);
        } else if (format === "text") {
          await exportConversationAsText(id);
        } else {
          await exportConversationAsMarkdown(id);
        }
        toast({
          title: "Success",
          description: `Conversation exported as ${format.toUpperCase()}`,
        });
      } catch (_error) {
        toast({
          title: "Error",
          description: "Failed to export conversation",
          variant: "destructive",
        });
      }
    };

    return (
      <div
        className={`group relative flex cursor-pointer flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-accent ${
          isActive ? "border-primary bg-accent" : ""
        } ${isPinned ? "border-l-4 border-l-primary" : ""}`}
        onClick={() => !isEditing && onSelect(id)}
      >
        {/* Pin Indicator */}
        {isPinned && (
          <div className="absolute right-2 top-2">
            <Pin className="h-3 w-3 fill-primary text-primary" />
          </div>
        )}

        {/* Title Section */}
        <div className="flex items-start justify-between gap-2">
          {isEditing ? (
            <div className="flex flex-1 items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="h-8 text-sm"
                autoFocus
                maxLength={100}
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveTitle}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-1 items-start gap-2">
                <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium">
                    {title}
                    {isPinned && (
                      <span className="ml-2 text-xs text-muted-foreground">(Pinned)</span>
                    )}
                  </h3>
                  {lastMessage && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{lastMessage}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>

                {/* More Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    {onTogglePin && (
                      <>
                        <DropdownMenuItem onClick={() => onTogglePin(id, isPinned)}>
                          <Pin className="mr-2 h-4 w-4" />
                          {isPinned ? "Unpin" : "Pin"} Conversation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => handleExport("json")}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("text")}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as Text
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("markdown")}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as Markdown
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this conversation and all its messages. This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}
        </div>

        {/* Footer Section */}
        {!isEditing && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{messageCount} messages</span>
            <span>{timeAgo}</span>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    return (
      prevProps.id === nextProps.id &&
      prevProps.title === nextProps.title &&
      prevProps.lastMessage === nextProps.lastMessage &&
      prevProps.messageCount === nextProps.messageCount &&
      prevProps.updatedAt === nextProps.updatedAt &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.isPinned === nextProps.isPinned
    );
  }
);
