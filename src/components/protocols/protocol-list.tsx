"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

interface Protocol {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  effectiveness_rank: number;
  difficulty: string;
  time_commitment: string;
  tags: string[];
}

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

function DifficultyDots({ difficulty }: { difficulty: string }) {
  const level = difficulty.toLowerCase().includes("easy")
    ? 1
    : difficulty.toLowerCase().includes("moderate") || difficulty.toLowerCase().includes("medium")
      ? 2
      : 3;
  return (
    <div className="flex gap-0.5 items-center" title={difficulty}>
      {[1, 2, 3].map((dot) => (
        <div
          key={dot}
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            dot <= level ? "bg-foreground/60" : "bg-foreground/15"
          )}
        />
      ))}
    </div>
  );
}

export function ProtocolList({
  categories,
  protocols,
}: {
  categories: Category[];
  protocols: Protocol[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = protocols.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search protocols..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors",
            !selectedCategory
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:border-foreground/30"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() =>
              setSelectedCategory(
                selectedCategory === cat.slug ? null : cat.slug
              )
            }
            className={cn(
              "px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors flex items-center gap-1",
              selectedCategory === cat.slug
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-foreground/30"
            )}
          >
            <span>{(categoryMeta[cat.slug] || defaultMeta).icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Protocol cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery || selectedCategory ? (
            <>
              <p>No protocols match your search.</p>
              <p className="text-sm mt-1">
                Try a different keyword or category.
              </p>
            </>
          ) : (
            <>
              <p>No protocols available yet.</p>
              <p className="text-sm mt-1">
                Data ingestion is in progress — check back soon.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((protocol) => {
            const meta = categoryMeta[protocol.category] || defaultMeta;
            return (
              <Link
                key={protocol.id}
                href={`/protocols/${protocol.slug}`}
              >
                <Card className="hover:border-foreground/20 transition-all cursor-pointer group overflow-hidden">
                  <div className="flex">
                    {/* Category accent bar */}
                    <div className={cn("w-1 shrink-0 rounded-l", meta.bg.replace("/10", "/40"))} />
                    <div className="flex-1 min-w-0">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", meta.bg)}>
                              <span className="text-sm">{meta.icon}</span>
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                {protocol.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-0.5">
                                <DifficultyDots difficulty={protocol.difficulty} />
                                {protocol.time_commitment && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {protocol.time_commitment}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={protocol.effectiveness_rank <= 3 ? "default" : "secondary"}
                            className="shrink-0 text-xs"
                          >
                            #{protocol.effectiveness_rank}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs line-clamp-2 mt-1">
                          {protocol.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 pb-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {protocol.tags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
