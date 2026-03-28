"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  onRenameSession: (sessionId: string, title: string) => Promise<boolean>;
  onDeleteSession: (sessionId: string) => Promise<boolean>;
}

export function ChatSidebar({
  sessions,
  activeSession,
  loadingSession,
  sidebarOpen,
  onLoadSession,
  onNewChat,
  onClose,
  onRenameSession,
  onDeleteSession,
}: ChatSidebarProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [menuOpen]);

  // Focus the edit input when entering edit mode
  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  function startRename(session: ChatSession) {
    setEditingId(session.id);
    setEditTitle(session.title || "");
    setMenuOpen(null);
  }

  async function commitRename() {
    if (editingId && editTitle.trim()) {
      await onRenameSession(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  }

  function startDelete(session: ChatSession) {
    setDeleteTarget(session);
    setMenuOpen(null);
  }

  async function confirmDelete() {
    if (deleteTarget) {
      await onDeleteSession(deleteTarget.id);
      setDeleteTarget(null);
    }
  }

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
        <div className="p-3 border-b border-border/40">
          <Button onClick={onNewChat} className="w-full" size="sm">
            + New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1 p-2">
          {sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No conversations yet
            </p>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div key={session.id} className="group relative">
                  {editingId === session.id ? (
                    <div className="px-2 py-1.5">
                      <Input
                        ref={editRef}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") { setEditingId(null); setEditTitle(""); }
                        }}
                        onBlur={commitRename}
                        className="h-7 text-xs"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => onLoadSession(session.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm truncate transition-colors pr-8 ${
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
                  )}

                  {editingId !== session.id && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === session.id ? null : session.id);
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>

                      {menuOpen === session.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1 w-36 rounded-md border bg-popover p-1 shadow-md z-50"
                        >
                          <button
                            onClick={() => startRename(session)}
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-muted transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                            Rename
                          </button>
                          <button
                            onClick={() => startDelete(session)}
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete conversation</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{deleteTarget?.title || "this conversation"}&quot; and all its messages. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
