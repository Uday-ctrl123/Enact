import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { chatMessageSchema } from "@/lib/validations";
import { validateInputLength } from "@/lib/security";
import { useToast } from "@/hooks/use-toast";
import { VoiceInputButton } from "@/components/VoiceInputButton";
import { useTranslation } from "react-i18next";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
  autoSendVoice?: boolean;
}

const MAX_MESSAGE_LENGTH = 2000;

export const ChatInput = ({ onSend, isLoading, autoSendVoice = true }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const { i18n } = useTranslation();

  const remainingChars = MAX_MESSAGE_LENGTH - input.length;
  const isNearLimit = remainingChars < 100;

  const handleSend = async () => {
    const trimmedInput = input.trim();

    // Validate input length
    const lengthValidation = validateInputLength(trimmedInput, MAX_MESSAGE_LENGTH);
    if (!lengthValidation.valid) {
      toast({
        title: "Message too long",
        description: lengthValidation.error,
        variant: "destructive",
      });
      return;
    }

    // Validate input with schema
    const validation = chatMessageSchema.safeParse({ content: trimmedInput });

    if (!validation.success) {
      toast({
        title: "Invalid message",
        description: validation.error.issues[0]?.message || "Please enter a valid message",
        variant: "destructive",
      });
      return;
    }

    if (!isLoading && trimmedInput) {
      await onSend(trimmedInput);
      setInput("");
    }
  };

  // Handle voice transcript completion
  const handleVoiceTranscript = async (transcript: string) => {
    if (autoSendVoice) {
      // Auto-send voice input
      await onSend(transcript);
    } else {
      // Populate input field for user review
      setInput(transcript);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
      className="flex gap-2"
    >
      <div className="relative flex-1">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question here..."
          className="flex-1"
          disabled={isLoading}
          maxLength={MAX_MESSAGE_LENGTH}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          aria-label="Chat message input"
          aria-describedby="char-count"
        />
        <div
          id="char-count"
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${
            isNearLimit ? "font-medium text-destructive" : "text-muted-foreground"
          }`}
          aria-live="polite"
        >
          {remainingChars}
        </div>
      </div>
      <VoiceInputButton
        onTranscriptComplete={handleVoiceTranscript}
        language={i18n.language}
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="icon"
        disabled={isLoading || !input.trim()}
        aria-label="Send message"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
    </form>
  );
};
