"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: { current: number; target: number };
}

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch("/api/profile/achievements");
        if (res.ok) {
          const data = await res.json();
          setAchievements(data.achievements);
          setUnlocked(data.unlocked);
          setTotal(data.total);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (achievements.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Achievements</CardTitle>
          <span className="text-sm text-muted-foreground">
            {unlocked}/{total} unlocked
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={cn(
                "relative flex flex-col items-center justify-center p-3 rounded-lg text-center transition-all",
                a.unlocked
                  ? "bg-primary/5 border border-primary/20"
                  : "bg-muted/50 opacity-60"
              )}
            >
              <span className={cn("text-2xl", !a.unlocked && "grayscale")}>
                {a.icon}
              </span>
              <p className="text-[11px] font-medium mt-1.5 leading-tight">
                {a.title}
              </p>
              {a.progress && !a.unlocked && (
                <div className="w-full mt-1.5">
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/40 transition-all"
                      style={{
                        width: `${Math.round((a.progress.current / a.progress.target) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    {a.progress.current}/{a.progress.target}
                  </p>
                </div>
              )}
              {a.unlocked && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[8px] text-primary-foreground">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
