"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Tool {
  id: string;
  title: string;
  description: string;
  instructions: string;
  effectiveness_rank: number;
  timing?: string;
  duration?: string;
  frequency?: string;
  notes?: string;
}

interface ProtocolToolCardProps {
  tool: Tool;
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
  return (
    <Card className={isCompleted ? "border-primary/30 bg-primary/5" : ""}>
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
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
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
          <p className="whitespace-pre-wrap">{tool.instructions}</p>
          <div className="flex gap-2 flex-wrap mt-2">
            {tool.timing && (
              <Badge variant="secondary">When: {tool.timing}</Badge>
            )}
            {tool.duration && (
              <Badge variant="secondary">Duration: {tool.duration}</Badge>
            )}
            {tool.frequency && (
              <Badge variant="secondary">Frequency: {tool.frequency}</Badge>
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
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">
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
