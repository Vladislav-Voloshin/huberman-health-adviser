"use client";

const EXERCISE_OPTIONS = ["Never", "1-2x per week", "3-4x per week", "5+ per week"];

const SUPPLEMENT_OPTIONS = [
  "Never taken supplements", "Tried a few",
  "Regular supplement user", "Advanced biohacker",
];

interface StepExerciseSupplementsProps {
  exerciseFrequency: string;
  supplementExperience: string;
  onExerciseChange: (value: string) => void;
  onSupplementChange: (value: string) => void;
}

export function StepExerciseSupplements({
  exerciseFrequency,
  supplementExperience,
  onExerciseChange,
  onSupplementChange,
}: StepExerciseSupplementsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">How often do you exercise?</h2>
        <div className="grid grid-cols-2 gap-2">
          {EXERCISE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => onExerciseChange(opt)}
              className={`p-3 rounded-lg border text-sm transition-colors ${
                exerciseFrequency === opt
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Supplement experience?</h2>
        <div className="grid grid-cols-1 gap-2">
          {SUPPLEMENT_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => onSupplementChange(opt)}
              className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                supplementExperience === opt
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
