"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export function ChatInput({ input, loading, onInputChange, onSend }: ChatInputProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="border-t border-border/40 px-4 py-3">
      <div className="max-w-3xl mx-auto flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about health protocols..."
          className="min-h-[44px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button onClick={onSend} disabled={loading || !input.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
