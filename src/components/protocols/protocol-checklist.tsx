import { ProtocolToolCard } from "./protocol-tool-card";
import type { ProtocolTool } from "@/lib/types/database";

export function ProtocolChecklist({
  tools,
  isLoggedIn,
  isActive,
  completedToolIds,
  togglingToolId,
  onToggle,
}: {
  tools: ProtocolTool[];
  isLoggedIn: boolean;
  isActive: boolean;
  completedToolIds: Set<string>;
  togglingToolId: string | null;
  onToggle: (toolId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Tools (most effective first)</h2>
      {tools.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Detailed tools coming soon.
        </p>
      ) : (
        tools.map((tool, index) => (
          <ProtocolToolCard
            key={tool.id}
            tool={tool}
            index={index}
            isLoggedIn={isLoggedIn}
            isActive={isActive}
            isCompleted={completedToolIds.has(tool.id)}
            isToggling={togglingToolId === tool.id}
            onToggle={onToggle}
          />
        ))
      )}
    </div>
  );
}
