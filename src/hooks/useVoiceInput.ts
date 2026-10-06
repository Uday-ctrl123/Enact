import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onTranscriptComplete?: (transcript: string) => void;
}

export function useVoiceInput(options: VoiceInputOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");
  const isManualStopRef = useRef(false);
  const shouldBeListeningRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Computed full transcript for display (combines final + interim)
  const fullTranscript = useMemo(() => {
    const final = transcript || finalTranscriptRef.current;
    return interimTranscript ? `${final} ${interimTranscript}`.trim() : final;
  }, [transcript, interimTranscript]);

  // Language mapping for speech recognition (memoized to prevent recreation)
  const languageMap = useMemo(
    () => ({
      en: "en-IN", // English (India)
      hi: "hi-IN", // Hindi (India)
      te: "te-IN", // Telugu (India)
      ta: "ta-IN", // Tamil (India)
      ml: "ml-IN", // Malayalam (India)
    }),
    []
  );

  // Check if Web Speech API is supported
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      (window as unknown as typeof SpeechRecognition).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
    } else {
      setIsSupported(false);
      console.warn("Web Speech API is not supported in this browser");
    }
  }, []);

  // Store callback in ref to avoid dependency issues
  const onTranscriptCompleteRef = useRef(options.onTranscriptComplete);
  useEffect(() => {
    onTranscriptCompleteRef.current = options.onTranscriptComplete;
  }, [options.onTranscriptComplete]);

  // Configure speech recognition
  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    const lang = options.language || "en";

    // Set language
    recognition.lang = languageMap[lang] || "en-IN";

    // Set options
    recognition.continuous = options.continuous ?? true;
    recognition.interimResults = options.interimResults ?? true;
    recognition.maxAlternatives = options.maxAlternatives ?? 1;

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          finalText += transcriptText + " ";
        } else {
          interimText += transcriptText;
        }
      }

      finalTranscriptRef.current = finalText;
      setTranscript(finalText.trim());
      setInterimTranscript(interimText);
    };

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);

      let errorMessage = "Voice input error";
      let shouldStop = true;

      switch (event.error) {
        case "no-speech":
          // Don't stop on no-speech in continuous mode - just continue listening
          errorMessage = "Listening... (paused)";
          shouldStop = false;
          break;
        case "audio-capture":
          errorMessage = "Microphone not accessible. Please check permissions.";
          break;
        case "not-allowed":
          errorMessage = "Microphone permission denied. Please allow microphone access.";
          break;
        case "network":
          errorMessage = "Network error. Please check your connection.";
          break;
        case "aborted":
          errorMessage = "Voice input was aborted.";
          break;
        default:
          errorMessage = `Voice input error: ${event.error}`;
      }

      setError(errorMessage);

      if (shouldStop) {
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    // Handle end
    recognition.onend = () => {
      // Clear any pending restart
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      // If this was a manual stop, trigger the callback with the final transcript
      if (isManualStopRef.current) {
        setIsListening(false);
        shouldBeListeningRef.current = false;

        if (onTranscriptCompleteRef.current) {
          const finalText = finalTranscriptRef.current.trim();
          if (finalText) {
            onTranscriptCompleteRef.current(finalText);
          }
        }
        isManualStopRef.current = false;
      } else if (shouldBeListeningRef.current) {
        // Recognition stopped unexpectedly but we want to keep listening
        // Keep the UI showing as listening during restart
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldBeListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.error("Failed to restart recognition:", error);
              setIsListening(false);
              shouldBeListeningRef.current = false;
              toast({
                title: "Voice Input Stopped",
                description: "Unable to continue listening. Please try again.",
                variant: "destructive",
              });
            }
          }
        }, 100);
      } else {
        setIsListening(false);
      }
    };

    // Handle start
    recognition.onstart = () => {
      setIsListening(true);
      shouldBeListeningRef.current = true;
      setError(null);
    };
  }, [
    options.language,
    options.continuous,
    options.interimResults,
    options.maxAlternatives,
    toast,
    languageMap,
  ]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    if (!recognitionRef.current) return;

    try {
      // Reset transcript on new start
      finalTranscriptRef.current = "";
      setTranscript("");
      setInterimTranscript("");

      shouldBeListeningRef.current = true;
      recognitionRef.current.start();

      toast({
        title: "Listening...",
        description:
          "Speak your legal question clearly. If using Brave, you may need to disable Shields.",
      });
    } catch (error) {
      console.error("Error starting recognition:", error);
      shouldBeListeningRef.current = false;

      const errorMsg = error instanceof Error ? error.message : String(error);
      const isBraveIssue = errorMsg.includes("not-allowed") || errorMsg.includes("service");

      toast({
        title: "Voice Input Error",
        description: isBraveIssue
          ? "Brave browser may be blocking speech recognition. Try Chrome/Edge or disable Brave Shields for this site."
          : "Failed to start voice input. Please try again.",
        variant: "destructive",
      });
    }
  }, [isSupported, toast]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      isManualStopRef.current = true;
      shouldBeListeningRef.current = false;
      recognitionRef.current.stop();
    } catch (error) {
      console.error("Error stopping recognition:", error);
      isManualStopRef.current = false;
      shouldBeListeningRef.current = false;
    }
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    fullTranscript,
    error,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}

// Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    onstart: () => void;
  }

  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }

  var SpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };

  var webkitSpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };
}
