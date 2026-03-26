"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Protocol {
  id: string;
  title: string;
  category: string;
  description: string;
  effectiveness_rank: number;
  difficulty: string;
  time_commitment: string;
  tags: string[];
}

interface Tool {
  id: string;
  title: string;
  description: string;
  instructions: string;
  effectiveness_rank: number;
  timing?: string;
  duration?: string;
  frequency?: string;
  notes?: string;
}

interface StreakData {
  streak: number;
  longest_streak: number;
  total_days: number;
}

export function ProtocolDetail({
  protocol,
  tools,
  isActive: initialActive = false,
  isLoggedIn = false,
}: {
  protocol: Protocol;
  tools: Tool[];
  isActive?: boolean;
  isLoggedIn?: boolean;
}) {
  const [isActive, setIsActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);
  const [completedToolIds, setCompletedToolIds] = useState<Set<string>>(new Set());
  const [togglingToolId, setTogglingToolId] = useState<string | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  const fetchCompletions = useCallback(async () => {
    if (!isLoggedIn || !isActive) return;
    try {
      const res = await fetch(`/api/protocols/completions?protocol_id=${protocol.id}`);
      if (res.ok) {
        const data = await res.json();
        setCompletedToolIds(new Set(data.completed_tool_ids));
      }
    } catch (err) {
      console.warn("[Completions] Failed to fetch:", err);
    }
  }, [isLoggedIn, isActive, protocol.id]);

  const fetchStreaks = useCallback(async () => {
    if (!isLoggedIn || !isActive) return;
    try {
      const res = await fetch(`/api/protocols/completions?protocol_id=${protocol.id}&type=streaks`);
      if (res.ok) {
        const data = await res.json();
        setStreakData(data);
      }
    } catch (err) {
      console.warn("[Streaks] Failed to fetch:", err);
    }
  }, [isLoggedIn, isActive, protocol.id]);

  useEffect(() => {
    fetchCompletions();
    fetchStreaks();
  }, [fetchCompletions, fetchStreaks]);

  async function toggleProtocol() {
    setLoading(true);
    try {
      const res = await fetch("/api/protocols/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocol_id: protocol.id,
          action: isActive ? "deactivate" : "activate",
        }),
      });
      if (res.ok) {
        const newActive = !isActive;
        setIsActive(newActive);
        if (newActive) {
          fetchCompletions();
          fetchStreaks();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleToolCompletion(toolId: string) {
    setTogglingToolId(toolId);
    try {
      const res = await fetch("/api/protocols/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocol_id: protocol.id,
          tool_id: toolId,
        }),
      });
      if (res.ok) {
        setCompletedToolIds((prev) => {
          const next = new Set(prev);
          if (next.has(toolId)) {
            next.delete(toolId);
          } else {
            next.add(toolId);
          }
          return next;
        });
        // Refresh streaks after toggle
        fetchStreaks();
      }
    } finally {
      setTogglingToolId(null);
    }
  }

  const completedCount = completedToolIds.size;
  const totalTools = tools.length;
  const progressPct = totalTools > 0 ? (completedCount / totalTools) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/protocols"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Protocols
        </Link>
        <h1 className="text-2xl font-bold">{protocol.title}</h1>
        <p className="text-muted-foreground">{protocol.description}</p>
        <div className="flex gap-2 flex-wrap items-center">
          <Badge>Rank #{protocol.effectiveness_rank}</Badge>
          <Badge variant="outline">{protocol.difficulty}</Badge>
          {protocol.time_commitment && (
            <Badge variant="outline">{protocol.time_commitment}</Badge>
          )}
          {streakData && streakData.streak > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              {streakData.streak} day streak
            </Badge>
          )}
        </div>
        {isLoggedIn && (
          <Button
            onClick={toggleProtocol}
            disabled={loading}
            variant={isActive ? "outline" : "default"}
            className="mt-2"
          >
            {loading
              ? "..."
              : isActive
                ? "Remove from My Protocols"
                : "Add to My Protocols"}
          </Button>
        )}
      </div>

      <Separator />

      {/* Daily Progress Bar — only for active protocols */}
      {isLoggedIn && isActive && totalTools > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Today&apos;s Progress</p>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{totalTools} tools completed
              </p>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {streakData && (
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span>Current streak: {streakData.streak} days</span>
                <span>Longest: {streakData.longest_streak} days</span>
                <span>Total days: {streakData.total_days}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tools — ranked by effectiveness */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Tools (most effective first)
        </h2>
        {tools.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Detailed tools coming soon.
          </p>
        ) : (
          tools.map((tool, index) => {
            const isCompleted = completedToolIds.has(tool.id);
            const isToggling = togglingToolId === tool.id;
            return (
              <Card key={tool.id} className={isCompleted ? "border-primary/30 bg-primary/5" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    {isLoggedIn && isActive ? (
                      <button
                        onClick={() => toggleToolCompletion(tool.id)}
                        disabled={isToggling}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30 hover:border-primary"
                        } ${isToggling ? "opacity-50" : ""}`}
                        aria-label={isCompleted ? `Mark ${tool.title} incomplete` : `Mark ${tool.title} complete`}
                      >
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
                        )}
                      </button>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {index + 1}
                      </div>
                    )}
                    <div>
                      <CardTitle className={`text-base ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {tool.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pl-14">
                  <div className="space-y-2 text-sm">
                    <p className="whitespace-pre-wrap">{tool.instructions}</p>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {tool.timing && (
                        <Badge variant="secondary">When: {tool.timing}</Badge>
                      )}
                      {tool.duration && (
                        <Badge variant="secondary">
                          Duration: {tool.duration}
                        </Badge>
                      )}
                      {tool.frequency && (
                        <Badge variant="secondary">
                          Frequency: {tool.frequency}
                        </Badge>
                      )}
                    </div>
                    {tool.notes && (
                      <div className="text-muted-foreground text-xs mt-2 space-y-1">
                        {tool.notes.split("\n").map((line, i) => {
                          const linkMatch = line.match(
                            /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/
                          );
                          if (linkMatch) {
                            return (
                              <a
                                key={i}
                                href={linkMatch[2]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-primary hover:underline"
                              >
                                {linkMatch[1]} ↗
                              </a>
                            );
                          }
                          if (line.startsWith("**Evidence:**")) {
                            return (
                              <p key={i} className="font-semibold text-foreground mt-2">
                                Evidence & Sources
                              </p>
                            );
                          }
                          return line.trim() ? <p key={i}>{line}</p> : null;
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Chat CTA */}
      <Card className="bg-muted/50">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="font-medium text-sm">Have questions about this protocol?</p>
            <p className="text-xs text-muted-foreground">
              Start a chat with context already loaded
            </p>
          </div>
          <Link href={`/chat?protocol=${protocol.id}`}>
            <Button size="sm">Ask AI</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
