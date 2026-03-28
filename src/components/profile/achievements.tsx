"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  Sprout,
  Library,
  CheckCircle,
  Calendar,
  Trophy,
  Flame,
  Zap,
  Gem,
  MessageCircle,
  Brain,
  Heart,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Sprout, Library, CheckCircle, Calendar, Trophy, Flame, Zap, Gem, MessageCircle, Brain, Heart, Target,
};

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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.map((a) => {
            const Icon = iconMap[a.icon] || Target;
            return (
              <div
                key={a.id}
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 rounded-lg text-center transition-all",
                  a.unlocked
                    ? "bg-primary/5 border border-primary/20"
                    : "bg-muted/50 opacity-60"
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6",
                    a.unlocked ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <p className="text-xs font-medium mt-2 leading-tight">
                  {a.title}
                </p>
                {a.progress && !a.unlocked && (
                  <div className="w-full mt-2">
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/40 transition-all"
                        style={{ width: `${Math.round((a.progress.current / a.progress.target) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.progress.current}/{a.progress.target}
                    </p>
                  </div>
                )}
                {a.unlocked && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
