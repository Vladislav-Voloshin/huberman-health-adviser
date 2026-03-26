"use client";

import { Card, CardContent } from "@/components/ui/card";

interface StreakData {
  streak: number;
  longest_streak: number;
  total_days: number;
}

interface ProtocolProgressProps {
  completedCount: number;
  totalTools: number;
  streakData: StreakData | null;
}

export function ProtocolProgress({ completedCount, totalTools, streakData }: ProtocolProgressProps) {
  const progressPct = totalTools > 0 ? (completedCount / totalTools) * 100 : 0;

  return (
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
  );
}
