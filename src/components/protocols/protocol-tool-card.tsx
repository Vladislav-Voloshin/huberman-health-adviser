"use client";

import { useState } from "react";
import { Check, Clock, Timer, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProtocolTool } from "@/lib/types/database";

const INSTRUCTIONS_TRUNCATE_THRESHOLD = 200;
const INSTRUCTIONS_PREVIEW_LENGTH = 150;

function parseInstructions(text: string) {
  const lines = text.split("\n").filter((l) => l.trim());
  const numberedPattern = /^\d+\.\s+/;
  const bulletPattern = /^[-•]\s+/;

  const hasNumberedSteps = lines.some((l) => numberedPattern.test(l.trim()));
  const hasBullets = lines.some((l) => bulletPattern.test(l.trim()));

  if (hasNumberedSteps) {
    const items = lines
      .filter((l) => numberedPattern.test(l.trim()))
      .map((l) => l.trim().replace(numberedPattern, ""));
    return (
      <ol className="list-decimal list-inside space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="leading-relaxed">{item}</li>
        ))}
      </ol>
    );
  }

  if (hasBullets) {
    const items = lines
      .filter((l) => bulletPattern.test(l.trim()))
      .map((l) => l.trim().replace(bulletPattern, ""));
    return (
      <ul className="list-disc list-inside space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="leading-relaxed">{item}</li>
        ))}
      </ul>
    );
  }

  return <p className="whitespace-pre-wrap leading-relaxed">{text}</p>;
}

interface ProtocolToolCardProps {
  tool: ProtocolTool;
  index: number;
  isLoggedIn: boolean;
  isActive: boolean;
  isCompleted: boolean;
  isToggling: boolean;
  onToggle: (toolId: string) => void;
}

export function ProtocolToolCard({
  tool,
  index,
  isLoggedIn,
  isActive,
  isCompleted,
  isToggling,
  onToggle,
}: ProtocolToolCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongInstructions = tool.instructions.length > INSTRUCTIONS_TRUNCATE_THRESHOLD;
  return (
    <Card className={`${isCompleted ? "border-primary/30 bg-primary/5" : ""} ${index > 0 ? "border-t border-border/30" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {isLoggedIn && isActive ? (
            <button
              onClick={() => onToggle(tool.id)}
              disabled={isToggling}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                isCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/30 hover:border-primary"
              } ${isToggling ? "opacity-50" : ""}`}
              aria-label={isCompleted ? `Mark ${tool.title} incomplete` : `Mark ${tool.title} complete`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" strokeWidth={3} />
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
          <div className="text-foreground/90">
            {isLongInstructions && !isExpanded ? (
              <>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {tool.instructions.slice(0, INSTRUCTIONS_PREVIEW_LENGTH).trimEnd()}...
                </p>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-primary text-xs font-medium mt-1 hover:underline"
                >
                  Show more
                </button>
              </>
            ) : (
              <>
                {parseInstructions(tool.instructions)}
                {isLongInstructions && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-primary text-xs font-medium mt-1 hover:underline"
                  >
                    Show less
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex gap-2 flex-wrap mt-2">
            {tool.timing && (
              <Badge variant="outline" className="text-foreground/80 border-border/50">
                <Clock className="w-3 h-3 mr-1" />
                When: {tool.timing}
              </Badge>
            )}
            {tool.duration && (
              <Badge variant="outline" className="text-foreground/80 border-border/50">
                <Timer className="w-3 h-3 mr-1" />
                Duration: {tool.duration}
              </Badge>
            )}
            {tool.frequency && (
              <Badge variant="outline" className="text-foreground/80 border-border/50">
                <Repeat className="w-3 h-3 mr-1" />
                Frequency: {tool.frequency}
              </Badge>
            )}
          </div>
          {tool.notes && (
            <div className="text-muted-foreground text-xs mt-2 space-y-1">
              {tool.notes.split("\n").map((line, i) => {
                // Citation reference with link
                const refMatch = line.match(
                  /\*\*Reference:\*\*\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)/
                );
                if (refMatch) {
                  return (
                    <div key={i} className="mt-2 p-2 rounded-md bg-muted/50 border border-border/30">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground/70 mb-1">
                        Reference
                      </p>
                      <a
                        href={refMatch[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs leading-snug"
                      >
                        {refMatch[1]} ↗
                      </a>
                    </div>
                  );
                }
                // Generic markdown link
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
}
