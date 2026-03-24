"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface ChatSession {
  id: string;
  title: string;
  protocol_id?: string;
  created_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { type: string; title: string }[];
}

export function ChatInterface({
  userId,
  sessions,
}: {
  userId: string;
  sessions: ChatSession[];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: activeSession,
          user_id: userId,
        }),
      });

      const data = await res.json();

      if (data.session_id && !activeSession) {
        setActiveSession(data.session_id);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-20">
            <p className="text-lg font-medium">Ask me anything about health</p>
            <p className="text-sm mt-1 max-w-md">
              I&apos;m powered by the Huberman Lab podcast, newsletters, and
              research. Ask about sleep, exercise, supplements, or any health
              topic.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-lg">
              {[
                "How can I improve my sleep quality?",
                "What's the best morning routine for focus?",
                "Cold exposure benefits and protocol",
                "Best supplements for stress management",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  className="text-left text-sm p-3 rounded-lg border border-border/40 hover:border-border transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-[80%] px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/20">
                      <p className="text-xs text-muted-foreground">Sources:</p>
                      {msg.sources.map((s, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          {s.title}
                        </p>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <Card className="bg-muted px-4 py-3">
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Thinking...
                  </p>
                </Card>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border/40 px-4 py-3">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about health protocols..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
