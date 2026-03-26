"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface UserProtocol {
  id: string;
  is_active: boolean;
  started_at: string;
  protocols: { id: string; title: string; slug: string; category: string; description: string };
}

interface ProfileViewProps {
  profile: {
    email: string;
    display_name?: string;
    phone?: string;
    created_at: string;
  } | null;
  survey: {
    health_goals: string[];
    sleep_quality: number;
    exercise_frequency: string;
    stress_level: number;
    focus_areas: string[];
  } | null;
  activeProtocols: UserProtocol[];
}

export function ProfileView({
  profile,
  survey,
  activeProtocols,
}: ProfileViewProps) {
  const router = useRouter();
  const supabase = createClient();
  const [streaks, setStreaks] = useState<{ protocol_title: string; streak: number; longest_streak: number; total_days: number }[]>([]);

  const fetchStreaks = useCallback(async () => {
    if (activeProtocols.length === 0) return;
    const results = await Promise.all(
      activeProtocols.map(async (up) => {
        try {
          const res = await fetch(`/api/protocols/completions?protocol_id=${up.protocols.id}&type=streaks`);
          if (res.ok) {
            const data = await res.json();
            return { protocol_title: up.protocols.title, ...data };
          }
        } catch { /* ignore */ }
        return { protocol_title: up.protocols.title, streak: 0, longest_streak: 0, total_days: 0 };
      })
    );
    setStreaks(results);
  }, [activeProtocols]);

  useEffect(() => {
    fetchStreaks();
  }, [fetchStreaks]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const totalCompletionDays = streaks.reduce((sum, s) => sum + s.total_days, 0);
  const bestStreak = Math.max(0, ...streaks.map((s) => s.longest_streak));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{profile?.email}</span>
          </div>
          {profile?.phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{profile.phone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member since</span>
            <span>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      {survey && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Health Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Goals</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {survey.health_goals.map((g) => (
                  <Badge key={g} variant="secondary">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Sleep Quality</span>
                <p className="font-medium">{survey.sleep_quality}/10</p>
              </div>
              <div>
                <span className="text-muted-foreground">Stress Level</span>
                <p className="font-medium">{survey.stress_level}/10</p>
              </div>
              <div>
                <span className="text-muted-foreground">Exercise</span>
                <p className="font-medium">{survey.exercise_frequency}</p>
              </div>
            </div>
            <Separator />
            <div>
              <span className="text-sm text-muted-foreground">Focus Areas</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {survey.focus_areas.map((a) => (
                  <Badge key={a} variant="outline">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Protocol Stack</CardTitle>
        </CardHeader>
        <CardContent>
          {activeProtocols.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                No active protocols yet. Browse protocols and add them to your
                daily stack.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => router.push("/protocols")}
              >
                Browse Protocols
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeProtocols.map((up) => (
                <div
                  key={up.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:border-border transition-colors cursor-pointer"
                  onClick={() =>
                    router.push(`/protocols/${up.protocols.slug}`)
                  }
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {up.protocols.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {up.protocols.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {up.protocols.category}
                  </Badge>
                </div>
              ))}
              <p className="text-xs text-muted-foreground text-center pt-2">
                Added {activeProtocols.length} protocol
                {activeProtocols.length !== 1 ? "s" : ""} to your stack
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streaks & Completion Stats */}
      {activeProtocols.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Streaks & Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{activeProtocols.length}</p>
                <p className="text-xs text-muted-foreground">Active Protocols</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{totalCompletionDays}</p>
                <p className="text-xs text-muted-foreground">Total Days</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{bestStreak}</p>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
            </div>
            {/* Per-protocol streaks */}
            {streaks.length > 0 && (
              <div className="space-y-2">
                <Separator />
                {streaks.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1 min-w-0 pr-2">{s.protocol_title}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      {s.streak > 0 && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs">
                          {s.streak}d streak
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{s.total_days}d total</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Button variant="outline" onClick={handleSignOut} className="w-full">
        Sign Out
      </Button>
    </div>
  );
}
