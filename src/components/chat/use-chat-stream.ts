"use client";

import { useState, useRef, useCallback } from "react";
import type { Message, ChatSession } from "./types";

interface UseChatStreamOptions {
  userId: string;
  initialSessions: ChatSession[];
  initialProtocolId?: string;
}

export function useChatStream({ userId, initialSessions, initialProtocolId }: UseChatStreamOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [protocolId, setProtocolId] = useState<string | undefined>(initialProtocolId);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [loadingSession, setLoadingSession] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    setLoadingSession(true);
    try {
      const res = await fetch(`/api/chat/sessions?session_id=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(
          data.messages.map((m: Message & { id: string }) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            sources: m.sources,
            created_at: m.created_at,
          }))
        );
        setActiveSession(sessionId);
      }
    } finally {
      setLoadingSession(false);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setActiveSession(null);
    setProtocolId(undefined);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const assistantId = crypto.randomUUID();
    setStreamingId(assistantId);

    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", created_at: new Date().toISOString() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: activeSession,
          user_id: userId,
          protocol_id: !activeSession ? protocolId : undefined,
        }),
      });

      // Clear protocol context after first message creates the session
      if (protocolId && !activeSession) {
        setProtocolId(undefined);
      }

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6);
          try {
            const event = JSON.parse(json);

            if (event.type === "meta") {
              if (event.session_id && !activeSession) {
                setActiveSession(event.session_id);
                setSessions((prev) => [
                  {
                    id: event.session_id,
                    title: userMessage.content.slice(0, 50),
                    created_at: new Date().toISOString(),
                  },
                  ...prev,
                ]);
              }
              if (event.sources) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, sources: event.sources } : m
                  )
                );
              }
            } else if (event.type === "text") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + event.text } : m
                )
              );
              scrollToBottom();
            } else if (event.type === "error") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: "Sorry, something went wrong. Please try again.", sources: undefined }
                    : m
                )
              );
            }
          } catch {
            // Skip malformed SSE JSON chunks (expected during streaming)
          }
        }
      }
    } catch (err) {
      console.error("[Chat] Stream error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, something went wrong. Please try again.", sources: undefined }
            : m
        )
      );
    } finally {
      setLoading(false);
      setStreamingId(null);
    }
  }, [input, loading, activeSession, userId, protocolId, scrollToBottom]);

  return {
    messages,
    input,
    setInput,
    loading,
    activeSession,
    streamingId,
    sessions,
    loadingSession,
    scrollRef,
    scrollToBottom,
    loadSession,
    startNewChat,
    sendMessage,
  };
}
