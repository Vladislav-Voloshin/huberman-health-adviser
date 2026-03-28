"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DailyData {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

interface ProtocolRow {
  protocol_id: string;
  title: string;
  slug: string;
  total_tools: number;
  daily: DailyData[];
}

interface DashboardData {
  week_start: string;
  week_end: string;
  dates: string[];
  protocols: ProtocolRow[];
  overall_adherence: number;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function formatWeekRange(start: string, end: string): string {
  const s = new Date(start + "T12:00:00Z");
  const e = new Date(end + "T12:00:00Z");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString(undefined, opts)} — ${e.toLocaleDateString(undefined, opts)}`;
}

function CellColor({ percentage }: { percentage: number }) {
  if (percentage === 100) return "bg-green-500/80 dark:bg-green-500/60";
  if (percentage > 0) return "bg-yellow-400/70 dark:bg-yellow-500/50";
  return "bg-muted";
}

export function WeeklyDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  const fetchDashboard = useCallback(async (week: string) => {
    setLoading(true);
    try {
      const tz = new Date().getTimezoneOffset();
      const res = await fetch(`/api/protocols/dashboard?week=${week}&tz_offset=${tz}`);
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(weekStart);
  }, [weekStart, fetchDashboard]);

  function navigateWeek(direction: -1 | 1) {
    const d = new Date(weekStart + "T12:00:00Z");
    d.setDate(d.getDate() + direction * 7);
    setWeekStart(d.toISOString().split("T")[0]);
  }

  const isCurrentWeek = weekStart === getMonday(new Date());

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Progress Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Track your weekly protocol adherence
          </p>
        </div>
        <Link href="/protocols">
          <Button variant="outline" size="sm">Browse Protocols</Button>
        </Link>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium">
            {data ? formatWeekRange(data.week_start, data.week_end) : "Loading..."}
          </p>
          {isCurrentWeek && (
            <Badge variant="secondary" className="text-[10px] mt-1">This week</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateWeek(1)}
          disabled={isCurrentWeek}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !data || data.protocols.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No active protocols. Add protocols to your stack to track progress.
            </p>
            <Link href="/protocols">
              <Button variant="outline" size="sm" className="mt-4">
                Browse Protocols
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall adherence */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Adherence</p>
                  <p className="text-3xl font-bold">{data.overall_adherence}%</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{data.protocols.length} active protocol{data.protocols.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Completion</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid gap-1" style={{ gridTemplateColumns: "minmax(100px, 1fr) repeat(7, 1fr)" }}>
                <div />
                {DAY_LABELS.map((day, i) => {
                  const dateStr = data.dates[i];
                  const d = new Date(dateStr + "T12:00:00Z");
                  const isToday = dateStr === new Date().toISOString().split("T")[0];
                  return (
                    <div
                      key={day}
                      className={cn(
                        "text-center text-[10px] pb-1",
                        isToday ? "font-bold text-primary" : "text-muted-foreground"
                      )}
                    >
                      <div>{day}</div>
                      <div>{d.getUTCDate()}</div>
                    </div>
                  );
                })}

                {/* Protocol rows */}
                {data.protocols.map((protocol) => (
                  <>
                    <Link
                      key={protocol.protocol_id}
                      href={`/protocols/${protocol.slug}`}
                      className="text-xs font-medium truncate pr-2 flex items-center hover:text-primary transition-colors"
                    >
                      {protocol.title}
                    </Link>
                    {protocol.daily.map((day) => (
                      <div
                        key={`${protocol.protocol_id}-${day.date}`}
                        className={cn(
                          "aspect-square rounded-sm flex items-center justify-center text-[10px] font-medium",
                          CellColor({ percentage: day.percentage }),
                          day.percentage === 100
                            ? "text-green-950 dark:text-green-100"
                            : day.percentage > 0
                              ? "text-yellow-950 dark:text-yellow-100"
                              : "text-muted-foreground"
                        )}
                        title={`${day.completed}/${day.total} tools completed`}
                      >
                        {day.percentage > 0 ? `${day.percentage}%` : ""}
                      </div>
                    ))}
                  </>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-green-500/80 dark:bg-green-500/60" />
                  100% Complete
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-yellow-400/70 dark:bg-yellow-500/50" />
                  Partial
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-muted" />
                  None
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
