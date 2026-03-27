import { ProtocolToolCard } from "./protocol-tool-card";

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

export function ProtocolChecklist({
  tools,
  isLoggedIn,
  isActive,
  completedToolIds,
  togglingToolId,
  onToggle,
}: {
  tools: Tool[];
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
