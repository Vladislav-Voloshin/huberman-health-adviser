"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStream } from "./use-chat-stream";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMessageList } from "./chat-message-list";
import { ChatSuggestions } from "./chat-suggestions";
import { ChatInput } from "./chat-input";
import type { ChatSession } from "./types";

export type { ChatSession };

export function ChatInterface({
  userId,
  sessions: initialSessions,
  initialProtocolId,
}: {
  userId: string;
  sessions: ChatSession[];
  initialProtocolId?: string;
}) {
  const {
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
  } = useChatStream({ userId, initialSessions, initialProtocolId });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function handleLoadSession(sessionId: string) {
    loadSession(sessionId);
    setSidebarOpen(false);
  }

  function handleNewChat() {
    startNewChat();
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <ChatSidebar
        sessions={sessions}
        activeSession={activeSession}
        loadingSession={loadingSession}
        sidebarOpen={sidebarOpen}
        onLoadSession={handleLoadSession}
        onNewChat={handleNewChat}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header with sidebar toggle (mobile) */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="text-sm font-medium truncate">
            {activeSession
              ? sessions.find((s) => s.id === activeSession)?.title || "Chat"
              : "New Chat"}
          </p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <ChatSuggestions onSelect={setInput} />
          ) : (
            <ChatMessageList messages={messages} streamingId={streamingId} />
          )}
        </ScrollArea>

        <ChatInput
          input={input}
          loading={loading}
          onInputChange={setInput}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
}
