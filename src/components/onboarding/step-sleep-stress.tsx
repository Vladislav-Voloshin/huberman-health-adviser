"use client";

interface StepSleepStressProps {
  sleepQuality: number;
  stressLevel: number;
  onSleepChange: (value: number) => void;
  onStressChange: (value: number) => void;
}

export function StepSleepStress({
  sleepQuality,
  stressLevel,
  onSleepChange,
  onStressChange,
}: StepSleepStressProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">How would you rate your sleep?</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Poor</span>
          <input
            type="range"
            min="1"
            max="10"
            value={sleepQuality}
            onChange={(e) => onSleepChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground">Excellent</span>
          <span className="font-mono font-bold text-lg w-8 text-center">
            {sleepQuality}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Stress level?</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Low</span>
          <input
            type="range"
            min="1"
            max="10"
            value={stressLevel}
            onChange={(e) => onStressChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground">High</span>
          <span className="font-mono font-bold text-lg w-8 text-center">
            {stressLevel}
          </span>
        </div>
      </div>
    </div>
  );
}
