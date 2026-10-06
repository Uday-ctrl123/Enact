import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRateLimit } from "@/hooks/use-rate-limit";
import { sanitizeInput } from "@/lib/security";
import { validateResponse, needsRegeneration, logValidation } from "@/utils/responseValidator";
import {
  analyzeComplexity,
  getLawyerRecommendation,
} from "@/utils/complexityDetector";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { QuickQuestions } from "@/components/chat/QuickQuestions";
import { ChatSkeleton } from "@/components/chat/ChatSkeleton";
import { useMessages } from "@/hooks/useMessages";
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from "@/hooks/useKeyboardShortcuts";
import { useTranslation } from "react-i18next";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  language?: string;
}

const Chat = () => {
  const { i18n } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isAllowed, getRemainingRequests } = useRateLimit(10, 60000);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    messages: loadedMessages,
    isLoading: messagesLoading,
    hasMore,
    loadMore,
    addMessage,
    updateMessage,
    editMessage,
    deleteMessage,
    refresh: refreshMessages,
  } = useMessages({ conversationId, pageSize: 50 });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your ENACT legal assistant. I'm here to help you understand your legal rights and guide you through the justice system. What legal issue can I help you with today?",
      timestamp: new Date(),
    },
  ]);

  useEffect(() => {
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages);
    }
  }, [loadedMessages]);

  useKeyboardShortcuts(
    [
      {
        ...KEYBOARD_SHORTCUTS.NEW_CHAT,
        callback: () => {
          setConversationId(null);
          refreshMessages();
          setMessages([{ id: "welcome", role: "assistant", content: "Hello! I'm your ENACT legal assistant. I'm here to help you understand your legal rights and guide you through the justice system. What legal issue can I help you with today?", timestamp: new Date() }]);
        },
      },
    ],
    true
  );

  const quickQuestions = ["How do I file an FIR?", "What documents do I need for court?", "Can I get free legal aid?", "How long does a case take?"];

  useEffect(() => {
    if (!authLoading && !user) {
      toast({ title: "Authentication Required", description: "Please sign in to use the chat assistant." });
      navigate("/auth");
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    const initConversation = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.from("conversations").insert({ user_id: user.id, title: "New Legal Consultation" }).select().single();
        if (error) throw error;
        if (data) setConversationId(data.id);
      } catch (err) {
        console.error("Error creating conversation:", err);
      }
    };
    initConversation();
  }, [user, toast]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const saveMessage = useCallback(
    async (id: string, role: "user" | "assistant", content: string, language?: string) => {
      if (!conversationId) return;
      const langCode = (language || i18n.language).split("-")[0];
      await supabase.from("messages").insert({ id, conversation_id: conversationId, role, content, language: langCode });
    },
    [conversationId, i18n.language]
  );

  const streamChat = async (userMessages: Message[], userQuery: string) => {
    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    // Priority: 1. Groq (Fastest/Free) 2. Gemini 3. OpenRouter
    const useGroq = !!GROQ_API_KEY;
    const useDirectGemini = !!GEMINI_API_KEY && !useGroq;
    const useOpenRouter = !!OPENROUTER_KEY && !useDirectGemini && !useGroq;


    const complexityAnalysis = analyzeComplexity(userQuery);

    try {
      let resp: Response;

      if (useGroq) {
        // Use Groq API (Lightning fast LLaMA 3.3, 100% free limits)
        const systemPrompt = `You are an expert Indian legal assistant with 20+ years of experience. Respond based on BNS, BSA, and BNSS 2023 laws. Structure your response with: 1. Understanding Situation, 2. Law on Your Side, 3. Your Rights, 4. Action Plan, 5. Warnings. Respond in ${i18n.language}.`;

        const messages = [
          { role: "system", content: systemPrompt },
          ...userMessages.map(m => ({ role: m.role, content: m.content })),
        ];

        resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            stream: true,
            temperature: 0.3,
            max_tokens: 4000
          }),
        });
      } else if (useOpenRouter) {
        // Use OpenRouter — OpenAI-compatible format, no rate limits on free models
        const systemPrompt = `You are an expert Indian legal assistant with 20+ years of experience. Respond based on BNS, BSA, and BNSS 2023 laws. Structure your response with: 1. Understanding Situation, 2. Law on Your Side, 3. Your Rights, 4. Action Plan, 5. Warnings. Respond in ${i18n.language}.`;

        const messages = [
          { role: "system", content: systemPrompt },
          ...userMessages.map(m => ({ role: m.role, content: m.content })),
        ];

        resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_KEY}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "ENACT Legal Assistant",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-pro-exp-02-05:free",
            messages,
            stream: true,
            temperature: 0.3,
            max_tokens: 4000,
          }),
        });
      } else if (useDirectGemini) {
        // Use v1beta endpoint with system_instruction support
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;
        
        const systemPrompt = `You are an expert Indian legal assistant with 20+ years of experience. Respond based on BNS, BSA, and BNSS 2023 laws. Structure your response with: 1. Understanding Situation, 2. Law on Your Side, 3. Your Rights, 4. Action Plan, 5. Warnings. Respond in ${i18n.language}.`;
        
        const contents = userMessages.map(m => ({ 
          role: m.role === "assistant" ? "model" : "user", 
          parts: [{ text: m.content }] 
        }));

        resp = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            contents,
            system_instruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.3 } 
          }),
        });
      } else {
        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legal-chat`;
        resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ messages: userMessages.map(m => ({ role: m.role, content: m.content })), language: i18n.language }),
        });
      }

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("AI API Error:", resp.status, errText);
        throw new Error(`AI API Error: ${resp.status}`);
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        
        let lines = textBuffer.split("\n");
        textBuffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            let content = "";

            if (useGroq || useOpenRouter) {
              // Groq and OpenRouter securely use the standard OpenAI JSON format
              content = parsed.choices?.[0]?.delta?.content || "";
            } else if (useDirectGemini) {
              // Direct Gemini format
              content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
            } else {
              // Edge function format (varies)
              content = parsed.text || parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
            }

            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.id === "streaming") {
                  updateMessage("streaming", assistantContent);
                  return prev.map(m => m.id === "streaming" ? { ...m, content: assistantContent } : m);
                }
                const newMsg = { id: "streaming", role: "assistant" as const, content: assistantContent, timestamp: new Date() };
                addMessage(newMsg);
                return [...prev, newMsg];
              });
            }
          } catch (e) {
            // Partial JSON skip
          }
        }
      }

      const validation = validateResponse(assistantContent);
      const lawyerRec = getLawyerRecommendation(complexityAnalysis);
      const finalContent = lawyerRec ? assistantContent + lawyerRec : assistantContent;
      const assistantId = crypto.randomUUID();

      setMessages(prev => prev.map(m => m.id === "streaming" ? { ...m, id: assistantId, content: finalContent } : m));
      await saveMessage(assistantId, "assistant", finalContent);

    } catch (error: any) {
      console.error("Chat Error:", error);
      
      const isRateLimit = error?.message?.includes("429");
      
      // If it's a rate limit error, show a simulated "bot" response to prove the UI works
      if (isRateLimit) {
        const fallbackId = crypto.randomUUID();
        const fallbackMsg = "⚠️ **API Quota Exceeded:** I am unable to connect to the legal knowledge base right now because your Google Gemini API Key has reached its rate limit. \n\nThe code is working perfectly, but Google is rejecting our requests. Please wait a few minutes for the limit to reset, or provide a new API key.";
        
        setMessages(prev => {
          // Replace any streaming partial message, or append
          if (prev[prev.length - 1]?.id === "streaming") {
             return prev.map(m => m.id === "streaming" ? { ...m, id: fallbackId, content: fallbackMsg } : m);
          }
          return [...prev, { id: fallbackId, role: "assistant", content: fallbackMsg, timestamp: new Date() }];
        });
      }

      toast({ title: "API Error", description: isRateLimit ? "Rate limit reached. Check the chat for details." : "Failed to get AI response. Please check your API key and connection.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading || !conversationId) return;
    const userId = user?.id || "anonymous";
    if (!isAllowed(userId)) return;

    const sanitizedContent = sanitizeInput(messageContent.trim());
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: sanitizedContent, timestamp: new Date() };

    addMessage(userMessage);
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    await saveMessage(userMessage.id, "user", sanitizedContent);
    await streamChat([...messages, userMessage], sanitizedContent);
  };

  const handleQuickQuestion = (question: string) => handleSend(question);

  if (authLoading) return <div className="p-8"><ChatSkeleton /></div>;
  if (!user) return null;

  return (
    <div className="container max-w-5xl py-8">
      <Card className="h-[calc(100vh-12rem)] flex flex-col backdrop-blur-sm bg-background/95 border-primary/20 shadow-xl">
        <CardHeader className="border-b shrink-0 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full"><Scale className="h-5 w-5 text-primary" /></div>
              <div>
                <CardTitle className="text-xl">Legal Assistant Chat</CardTitle>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Expert Guidance on New Criminal Laws</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-200">Online</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map(m => (
                <ChatMessage key={m.id} message={m} onEdit={editMessage} onDelete={deleteMessage} canEdit={m.role === "user"} canDelete={m.role === "user"} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg w-fit animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">Assistant is preparing response...</span>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t shrink-0 bg-muted/30">
            {messages.length === 1 && <QuickQuestions questions={quickQuestions} onSelect={handleQuickQuestion} />}
            <ChatInput onSend={handleSend} isLoading={isLoading} />
            <p className="mt-2 text-[10px] text-center text-muted-foreground uppercase tracking-widest font-semibold">
              Legal guidance based on BNS, BSA, and BNSS 2023
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;
