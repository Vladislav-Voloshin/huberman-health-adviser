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

const categoryIcons: Record<string, string> = {
  sleep: "🌙",
  focus: "🧠",
  exercise: "💪",
  stress: "❤️",
  nutrition: "🍎",
  hormones: "⚡",
  "cold-heat": "🧊",
  light: "☀️",
  motivation: "🎯",
  "mental-health": "😊",
};

export function ProtocolList({
  categories,
  protocols,
}: {
  categories: Category[];
  protocols: Protocol[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = selectedCategory
    ? protocols.filter((p) => p.category === selectedCategory)
    : protocols;

  return (
    <div className="space-y-4">
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
            <span>{categoryIcons[cat.slug] || "📋"}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Protocol cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No protocols available yet.</p>
          <p className="text-sm mt-1">
            Data ingestion is in progress — check back soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((protocol) => (
            <Link
              key={protocol.id}
              href={`/protocols/${protocol.slug}`}
            >
              <Card className="hover:border-foreground/20 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {categoryIcons[protocol.category] || "📋"}
                      </span>
                      <CardTitle className="text-base">
                        {protocol.title}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={
                        protocol.effectiveness_rank <= 3
                          ? "default"
                          : "secondary"
                      }
                    >
                      #{protocol.effectiveness_rank}
                    </Badge>
                  </div>
                  <CardDescription>{protocol.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{protocol.difficulty}</Badge>
                    {protocol.time_commitment && (
                      <Badge variant="outline">
                        {protocol.time_commitment}
                      </Badge>
                    )}
                    {protocol.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
