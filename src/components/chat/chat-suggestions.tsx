"use client";

import { useState, useEffect } from "react";

const GENERIC_SUGGESTIONS = [
  "How can I improve my sleep quality?",
  "What's the best morning routine for focus?",
  "Cold exposure benefits and protocol",
  "Best supplements for stress management",
];

const FOCUS_AREA_SUGGESTIONS: Record<string, string[]> = {
  Sleep: [
    "What's the ideal sleep protocol for deep rest?",
    "How does light exposure affect my sleep cycle?",
  ],
  "Focus & Productivity": [
    "What supplements boost focus and concentration?",
    "How can I optimize my dopamine for sustained focus?",
  ],
  "Exercise & Recovery": [
    "Best recovery protocols after intense training?",
    "How should I time exercise for optimal performance?",
  ],
  "Stress & Anxiety": [
    "What breathing techniques reduce stress fastest?",
    "How does cold exposure help with anxiety?",
  ],
  Nutrition: [
    "What should I eat to support cognitive performance?",
    "How does meal timing affect energy levels?",
  ],
  Hormones: [
    "How can I naturally optimize testosterone levels?",
    "What protocols support healthy hormone balance?",
  ],
  "Cold/Heat Exposure": [
    "What's the ideal cold plunge protocol for beginners?",
    "How do sauna sessions benefit recovery and longevity?",
  ],
  "Light Optimization": [
    "How should I use morning sunlight for energy?",
    "What light practices improve circadian rhythm?",
  ],
  "Motivation & Dopamine": [
    "How can I reset my dopamine baseline?",
    "What daily habits build sustainable motivation?",
  ],
  "Mental Health": [
    "What protocols support mood and emotional balance?",
    "How does exercise affect mental health outcomes?",
  ],
};

const GOAL_SUGGESTIONS: Record<string, string> = {
  "Better Sleep": "Give me a complete bedtime routine for better sleep",
  "More Energy": "What's the best protocol for all-day energy?",
  "Reduce Stress": "Help me build a daily stress management routine",
  "Build Muscle": "What supplements and protocols help with muscle growth?",
  "Lose Weight": "What's the science behind effective fat loss protocols?",
  "Improve Focus": "Create a focus protocol I can use during work hours",
  "Better Mood": "What protocols improve mood naturally?",
  Longevity: "What are the top longevity protocols backed by science?",
};

function buildSuggestions(focusAreas: string[], healthGoals: string[]): string[] {
  const suggestions: string[] = [];

  for (const area of focusAreas) {
    const areaSuggestions = FOCUS_AREA_SUGGESTIONS[area];
    if (areaSuggestions && suggestions.length < 4) {
      suggestions.push(areaSuggestions[Math.floor(Math.random() * areaSuggestions.length)]);
    }
  }

  for (const goal of healthGoals) {
    if (suggestions.length >= 4) break;
    const goalSuggestion = GOAL_SUGGESTIONS[goal];
    if (goalSuggestion && !suggestions.includes(goalSuggestion)) {
      suggestions.push(goalSuggestion);
    }
  }

  // Fill remaining slots with generic
  let i = 0;
  while (suggestions.length < 4 && i < GENERIC_SUGGESTIONS.length) {
    if (!suggestions.includes(GENERIC_SUGGESTIONS[i])) {
      suggestions.push(GENERIC_SUGGESTIONS[i]);
    }
    i++;
  }

  return suggestions.slice(0, 4);
}

interface ChatSuggestionsProps {
  onSelect: (suggestion: string) => void;
  focusAreas?: string[];
  healthGoals?: string[];
}

export function ChatSuggestions({ onSelect, focusAreas = [], healthGoals = [] }: ChatSuggestionsProps) {
  const hasPersonalization = focusAreas.length > 0 || healthGoals.length > 0;

  // Use GENERIC_SUGGESTIONS as initial state to match server render and avoid
  // hydration mismatch. The useEffect below picks personalized suggestions
  // client-side only (Math.random is non-deterministic across server/client).
  const [suggestions, setSuggestions] = useState<string[]>(GENERIC_SUGGESTIONS);

  useEffect(() => {
    setSuggestions(buildSuggestions(focusAreas, healthGoals));
  }, [focusAreas, healthGoals]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-20">
      <p className="text-lg font-medium">Ask me anything about health</p>
      <p className="text-sm mt-1 max-w-md">
        {hasPersonalization
          ? "Here are some suggestions based on your interests."
          : "I use science-backed protocols and research to help you optimize sleep, exercise, supplements, and more."}
      </p>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-lg"
        data-testid="chat-suggestions"
      >
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            className="text-left text-sm p-3 rounded-lg border border-border/40 hover:border-border transition-colors"
            data-testid="chat-suggestion-btn"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
