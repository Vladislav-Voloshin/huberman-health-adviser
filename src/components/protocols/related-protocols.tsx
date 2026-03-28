import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Protocol } from "@/lib/types/database";

const categoryMeta: Record<string, { icon: string; accent: string; bg: string }> = {
  sleep: { icon: "🌙", accent: "text-indigo-500", bg: "bg-indigo-500/10" },
  focus: { icon: "🧠", accent: "text-amber-500", bg: "bg-amber-500/10" },
  exercise: { icon: "💪", accent: "text-emerald-500", bg: "bg-emerald-500/10" },
  stress: { icon: "❤️", accent: "text-rose-500", bg: "bg-rose-500/10" },
  nutrition: { icon: "🍎", accent: "text-green-500", bg: "bg-green-500/10" },
  hormones: { icon: "⚡", accent: "text-yellow-500", bg: "bg-yellow-500/10" },
  "cold-heat": { icon: "🧊", accent: "text-cyan-500", bg: "bg-cyan-500/10" },
  light: { icon: "☀️", accent: "text-orange-500", bg: "bg-orange-500/10" },
  motivation: { icon: "🎯", accent: "text-purple-500", bg: "bg-purple-500/10" },
  "mental-health": { icon: "😊", accent: "text-pink-500", bg: "bg-pink-500/10" },
};

const defaultMeta = { icon: "📋", accent: "text-muted-foreground", bg: "bg-muted" };

export function RelatedProtocols({ protocols }: { protocols: Protocol[] }) {
  if (protocols.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Related Protocols</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {protocols.map((protocol) => {
          const meta = categoryMeta[protocol.category] || defaultMeta;
          return (
            <Link key={protocol.id} href={`/protocols/${protocol.slug}`}>
              <Card className="h-full hover:border-border transition-colors">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className={cn("text-lg shrink-0 w-8 h-8 flex items-center justify-center rounded-md", meta.bg)}>
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{protocol.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {protocol.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {protocol.difficulty}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {protocol.time_commitment}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
