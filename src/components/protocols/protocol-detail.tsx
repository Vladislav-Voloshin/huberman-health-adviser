"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Protocol {
  id: string;
  title: string;
  category: string;
  description: string;
  effectiveness_rank: number;
  difficulty: string;
  time_commitment: string;
  tags: string[];
}

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

export function ProtocolDetail({
  protocol,
  tools,
  isActive: initialActive = false,
  isLoggedIn = false,
}: {
  protocol: Protocol;
  tools: Tool[];
  isActive?: boolean;
  isLoggedIn?: boolean;
}) {
  const [isActive, setIsActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  async function toggleProtocol() {
    setLoading(true);
    try {
      const res = await fetch("/api/protocols/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocol_id: protocol.id,
          action: isActive ? "deactivate" : "activate",
        }),
      });
      if (res.ok) setIsActive(!isActive);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/protocols"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Protocols
        </Link>
        <h1 className="text-2xl font-bold">{protocol.title}</h1>
        <p className="text-muted-foreground">{protocol.description}</p>
        <div className="flex gap-2 flex-wrap">
          <Badge>Rank #{protocol.effectiveness_rank}</Badge>
          <Badge variant="outline">{protocol.difficulty}</Badge>
          {protocol.time_commitment && (
            <Badge variant="outline">{protocol.time_commitment}</Badge>
          )}
        </div>
        {isLoggedIn && (
          <Button
            onClick={toggleProtocol}
            disabled={loading}
            variant={isActive ? "outline" : "default"}
            className="mt-2"
          >
            {loading
              ? "..."
              : isActive
                ? "Remove from My Protocols"
                : "Add to My Protocols"}
          </Button>
        )}
      </div>

      <Separator />

      {/* Tools — ranked by effectiveness */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Tools (most effective first)
        </h2>
        {tools.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Detailed tools coming soon.
          </p>
        ) : (
          tools.map((tool, index) => (
            <Card key={tool.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-base">{tool.title}</CardTitle>
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
                      <Badge variant="secondary">
                        Duration: {tool.duration}
                      </Badge>
                    )}
                    {tool.frequency && (
                      <Badge variant="secondary">
                        Frequency: {tool.frequency}
                      </Badge>
                    )}
                  </div>
                  {tool.notes && (
                    <p className="text-muted-foreground text-xs mt-2">
                      {tool.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Chat CTA */}
      <Card className="bg-muted/50">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="font-medium text-sm">Have questions about this protocol?</p>
            <p className="text-xs text-muted-foreground">
              Start a chat with context already loaded
            </p>
          </div>
          <Link href={`/chat?protocol=${protocol.id}`}>
            <Button size="sm">Ask AI</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
