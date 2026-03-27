"use client";

import { FOCUS_AREAS } from "@/lib/survey-constants";

interface StepFocusAreasProps {
  selectedAreas: string[];
  onToggle: (area: string) => void;
}

export function StepFocusAreas({ selectedAreas, onToggle }: StepFocusAreasProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        What topics interest you most?
      </h2>
      <p className="text-muted-foreground text-sm">
        We&apos;ll prioritize protocols in these areas
      </p>
      <div className="grid grid-cols-2 gap-2">
        {FOCUS_AREAS.map((area) => (
          <button
            key={area}
            onClick={() => onToggle(area)}
            className={`p-3 rounded-lg border text-sm text-left transition-colors ${
              selectedAreas.includes(area)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-foreground/30"
            }`}
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  );
}
