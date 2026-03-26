"use client";

const SUGGESTIONS = [
  "How can I improve my sleep quality?",
  "What's the best morning routine for focus?",
  "Cold exposure benefits and protocol",
  "Best supplements for stress management",
];

interface ChatSuggestionsProps {
  onSelect: (suggestion: string) => void;
}

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-20">
      <p className="text-lg font-medium">Ask me anything about health</p>
      <p className="text-sm mt-1 max-w-md">
        I use science-backed protocols and research to help you optimize
        sleep, exercise, supplements, and more.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-lg">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            className="text-left text-sm p-3 rounded-lg border border-border/40 hover:border-border transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
