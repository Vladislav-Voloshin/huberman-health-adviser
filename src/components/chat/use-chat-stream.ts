"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Message, ChatSession } from "./types";

interface UseChatStreamOptions {
  userId: string;
  initialSessions: ChatSession[];
  initialProtocolId?: string;
}

export function useChatStream({ userId: _userId, initialSessions, initialProtocolId }: UseChatStreamOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [protocolId, setProtocolId] = useState<string | undefined>(initialProtocolId);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [loadingSession, setLoadingSession] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight stream on unmount (navigation away)
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    abortRef.current?.abort();
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
    abortRef.current?.abort();
    setMessages([]);
    setActiveSession(null);
    setProtocolId(undefined);
  }, []);

  const renameSession = useCallback(async (sessionId: string, title: string) => {
    const res = await fetch("/api/chat/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, title }),
    });
    if (res.ok) {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title } : s))
      );
      return true;
    }
    return false;
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/chat/sessions?id=${sessionId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSession === sessionId) {
        setMessages([]);
        setActiveSession(null);
      }
      return true;
    }
    return false;
  }, [activeSession]);

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
      // Abort any previous in-flight stream before starting a new one
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: activeSession,
          protocol_id: !activeSession ? protocolId : undefined,
        }),
        signal: controller.signal,
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
                    protocol_id: null,
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
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("[Chat] Stream error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, something went wrong. Please try again.", sources: undefined }
            : m
        )
      );
    } finally {
      abortRef.current = null;
      setLoading(false);
      setStreamingId(null);
    }
  }, [input, loading, activeSession, protocolId, scrollToBottom]);

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
    renameSession,
    deleteSession,
  };
}
