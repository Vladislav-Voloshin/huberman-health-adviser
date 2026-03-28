"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatTime } from "./utils";
import type { Message } from "./types";

interface ChatMessageListProps {
  messages: Message[];
  streamingId: string | null;
}

export function ChatMessageList({ messages, streamingId }: ChatMessageListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyToClipboard(text: string, msgId: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div className="max-w-[80%] group">
            <Card
              className={`px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.role === "user" ? (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-pre:my-2 prose-code:text-xs prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-background/50 prose-pre:p-3 prose-pre:rounded-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                  {streamingId === msg.id && (
                    <span className="inline-block w-1.5 h-4 bg-foreground/60 animate-pulse ml-0.5 align-text-bottom" />
                  )}
                </div>
              )}
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
            {/* Timestamp + Copy button */}
            <div className="flex items-center gap-2 mt-1 px-1">
              <span className="text-[10px] text-muted-foreground">
                {formatTime(msg.created_at)}
              </span>
              {msg.role === "assistant" && msg.content && !streamingId && (
                <button
                  onClick={() => copyToClipboard(msg.content, msg.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                  title="Copy message"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
