"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ProtocolHeader } from "./protocol-header";
import { ProtocolProgress } from "./protocol-progress";
import { ProtocolChecklist } from "./protocol-checklist";
import { ProtocolChatCta } from "./protocol-chat-cta";
import { useProtocolCompletions } from "./use-protocol-completions";
import type { Protocol, ProtocolTool } from "@/types/database";

export function ProtocolDetail({
  protocol,
  tools,
  isActive: initialActive = false,
  isLoggedIn = false,
}: {
  protocol: Protocol;
  tools: ProtocolTool[];
  isActive?: boolean;
  isLoggedIn?: boolean;
}) {
  const [isActive, setIsActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  const { completedToolIds, togglingToolId, streakData, toggleToolCompletion, refetch } =
    useProtocolCompletions(protocol.id, isLoggedIn, isActive);

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
      if (res.ok) {
        const newActive = !isActive;
        setIsActive(newActive);
        if (newActive) refetch();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <ProtocolHeader
        title={protocol.title}
        description={protocol.description}
        difficulty={protocol.difficulty}
        timeCommitment={protocol.time_commitment}
        streakData={streakData}
        isLoggedIn={isLoggedIn}
        isActive={isActive}
        loading={loading}
        onToggleProtocol={toggleProtocol}
      />

      <Separator />

      {isLoggedIn && isActive && tools.length > 0 && (
        <ProtocolProgress completedCount={completedToolIds.size} totalTools={tools.length} streakData={streakData} />
      )}

      <ProtocolChecklist
        tools={tools}
        isLoggedIn={isLoggedIn}
        isActive={isActive}
        completedToolIds={completedToolIds}
        togglingToolId={togglingToolId}
        onToggle={toggleToolCompletion}
      />

      <ProtocolChatCta protocolId={protocol.id} />
    </div>
  );
}
