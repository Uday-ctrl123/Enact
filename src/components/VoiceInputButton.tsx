import { useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  onTranscriptComplete: (transcript: string) => void;
  language: string;
  disabled?: boolean;
}

export function VoiceInputButton({
  onTranscriptComplete,
  language,
  disabled = false,
}: VoiceInputButtonProps) {
  const {
    isListening,
    isSupported,
    interimTranscript,
    fullTranscript,
    toggleListening,
    resetTranscript,
  } = useVoiceInput({
    language,
    continuous: true,
    interimResults: true,
    onTranscriptComplete: (finalText) => {
      onTranscriptComplete(finalText);
      resetTranscript();
    },
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to toggle (when button is focused)
      if (e.code === "Space" && document.activeElement?.getAttribute("data-voice-button")) {
        e.preventDefault();
        if (!disabled) {
          toggleListening();
        }
      }
      // Escape to stop and discard
      if (e.code === "Escape" && isListening) {
        e.preventDefault();
        resetTranscript();
        toggleListening();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isListening, disabled, toggleListening, resetTranscript]);

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  const characterCount = fullTranscript.length;
  const displayTranscript = fullTranscript.slice(-500); // Last 500 characters

  return (
    <Popover open={isListening}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={isListening ? "destructive" : "ghost"}
          size="icon"
          onClick={toggleListening}
          disabled={disabled}
          data-voice-button="true"
          className={cn("relative", isListening && "animate-pulse")}
          aria-label={isListening ? "Stop voice input" : "Start voice input"}
          aria-pressed={isListening}
        >
          {isListening ? (
            <Mic className="h-4 w-4" aria-hidden="true" />
          ) : (
            <MicOff className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">
            {isListening ? "Recording... Click to stop" : "Click to start voice input"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-80"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 animate-pulse text-destructive" />
              <span className="text-sm font-medium">
                {interimTranscript ? "Listening..." : "Listening... (paused)"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{characterCount} chars</span>
          </div>

          {displayTranscript && (
            <div className="max-h-32 overflow-y-auto rounded-md bg-muted p-2">
              <p className="whitespace-pre-wrap break-words text-sm">
                {displayTranscript}
                {interimTranscript && (
                  <span className="italic text-muted-foreground"> {interimTranscript}</span>
                )}
              </p>
            </div>
          )}

          {!displayTranscript && !interimTranscript && (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              Speak your legal question clearly...
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-xs text-muted-foreground">Click button or press Esc to stop</span>
            <Button size="sm" variant="outline" onClick={toggleListening} className="h-7 text-xs">
              Stop Recording
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
