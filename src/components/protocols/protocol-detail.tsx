"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProtocolToolCard } from "./protocol-tool-card";
import { ProtocolProgress } from "./protocol-progress";
import type { Protocol, ProtocolTool, StreakData } from "@/types/database";

export function ProtocolDetail({
  protocol,
  tools,
  isActive: initialActive = false,
  isLoggedIn = false,
}: {
  protocol: Protocol;
  tools: ProtocolTool[];
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
      const tz = new Date().getTimezoneOffset();
      const res = await fetch(`/api/protocols/completions?protocol_id=${protocol.id}&tz_offset=${tz}`);
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
      const tz = new Date().getTimezoneOffset();
      const res = await fetch(`/api/protocols/completions?protocol_id=${protocol.id}&type=streaks&tz_offset=${tz}`);
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
          tz_offset: new Date().getTimezoneOffset(),
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
        fetchStreaks();
      }
    } finally {
      setTogglingToolId(null);
    }
  }

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

      {/* Daily Progress Bar */}
      {isLoggedIn && isActive && tools.length > 0 && (
        <ProtocolProgress
          completedCount={completedToolIds.size}
          totalTools={tools.length}
          streakData={streakData}
        />
      )}

      {/* Tools */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Tools (most effective first)
        </h2>
        {tools.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Detailed tools coming soon.
          </p>
        ) : (
          tools.map((tool, index) => (
            <ProtocolToolCard
              key={tool.id}
              tool={tool}
              index={index}
              isLoggedIn={isLoggedIn}
              isActive={isActive}
              isCompleted={completedToolIds.has(tool.id)}
              isToggling={togglingToolId === tool.id}
              onToggle={toggleToolCompletion}
            />
          ))
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
