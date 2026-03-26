"use client";

const HEALTH_GOALS = [
  "Better Sleep", "More Energy", "Reduce Stress", "Build Muscle",
  "Lose Weight", "Improve Focus", "Better Mood", "Longevity",
];

interface StepHealthGoalsProps {
  selectedGoals: string[];
  onToggle: (goal: string) => void;
}

export function StepHealthGoals({ selectedGoals, onToggle }: StepHealthGoalsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">What are your health goals?</h2>
      <p className="text-muted-foreground text-sm">Select all that apply</p>
      <div className="grid grid-cols-2 gap-2">
        {HEALTH_GOALS.map((goal) => (
          <button
            key={goal}
            onClick={() => onToggle(goal)}
            className={`p-3 rounded-lg border text-sm text-left transition-colors ${
              selectedGoals.includes(goal)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-foreground/30"
            }`}
          >
            {goal}
          </button>
        ))}
      </div>
    </div>
  );
}
