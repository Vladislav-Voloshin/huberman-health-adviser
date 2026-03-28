"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSearch } from "./chat-search";
import { formatSessionDate } from "./utils";
import type { ChatSession } from "./types";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSession: string | null;
  loadingSession: boolean;
  sidebarOpen: boolean;
  onLoadSession: (sessionId: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

export function ChatSidebar({
  sessions,
  activeSession,
  loadingSession,
  sidebarOpen,
  onLoadSession,
  onNewChat,
  onClose,
}: ChatSidebarProps) {
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:relative z-30 md:z-auto w-64 h-full bg-background border-r border-border/40 flex flex-col transition-transform duration-200`}
      >
        <div className="p-3 border-b border-border/40 space-y-2">
          <Button onClick={onNewChat} className="w-full" size="sm">
            + New Chat
          </Button>
          <ChatSearch onSelectResult={onLoadSession} />
        </div>
        <ScrollArea className="flex-1 p-2">
          {sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No conversations yet
            </p>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onLoadSession(session.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm truncate transition-colors ${
                    activeSession === session.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-foreground"
                  }`}
                  disabled={loadingSession}
                >
                  <p className="truncate font-medium text-xs">
                    {session.title || "New conversation"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatSessionDate(session.created_at)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
}
