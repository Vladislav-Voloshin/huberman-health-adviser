"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const healthGoals = [
  "Better Sleep",
  "More Energy",
  "Reduce Stress",
  "Build Muscle",
  "Lose Weight",
  "Improve Focus",
  "Better Mood",
  "Longevity",
];

const exerciseOptions = [
  "Never",
  "1-2x per week",
  "3-4x per week",
  "5+ per week",
];

const supplementOptions = [
  "Never taken supplements",
  "Tried a few",
  "Regular supplement user",
  "Advanced biohacker",
];

const focusAreas = [
  "Sleep",
  "Focus & Productivity",
  "Exercise & Recovery",
  "Stress & Anxiety",
  "Nutrition",
  "Hormones",
  "Cold/Heat Exposure",
  "Light Optimization",
  "Motivation & Dopamine",
  "Mental Health",
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [exerciseFrequency, setExerciseFrequency] = useState("");
  const [stressLevel, setStressLevel] = useState(5);
  const [supplementExperience, setSupplementExperience] = useState("");
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);

  function toggleGoal(goal: string) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  function toggleFocus(area: string) {
    setSelectedFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  async function handleComplete() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { error: surveyError } = await supabase.from("survey_responses").upsert({
        user_id: user.id,
        health_goals: selectedGoals,
        sleep_quality: sleepQuality,
        exercise_frequency: exerciseFrequency,
        stress_level: stressLevel,
        supplement_experience: supplementExperience,
        focus_areas: selectedFocusAreas,
      }, { onConflict: "user_id" });

      if (surveyError) {
        console.error("Survey save error:", surveyError);
        setLoading(false);
        return;
      }

      const { error: userError } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          email: user.email || null,
          onboarding_completed: true,
        }, { onConflict: "id" });

      if (userError) {
        console.error("User update error:", userError);
        setLoading(false);
        return;
      }

      router.push("/protocols");
    } catch (err) {
      console.error("Onboarding error:", err);
      setLoading(false);
    }
  }

  const steps = [
    // Step 0: Health goals
    <div key="goals" className="space-y-4">
      <h2 className="text-xl font-semibold">What are your health goals?</h2>
      <p className="text-muted-foreground text-sm">Select all that apply</p>
      <div className="grid grid-cols-2 gap-2">
        {healthGoals.map((goal) => (
          <button
            key={goal}
            onClick={() => toggleGoal(goal)}
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
    </div>,

    // Step 1: Sleep & Stress
    <div key="sleep" className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">How would you rate your sleep?</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Poor</span>
          <input
            type="range"
            min="1"
            max="10"
            value={sleepQuality}
            onChange={(e) => setSleepQuality(Number(e.target.value))}
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
            onChange={(e) => setStressLevel(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground">High</span>
          <span className="font-mono font-bold text-lg w-8 text-center">
            {stressLevel}
          </span>
        </div>
      </div>
    </div>,

    // Step 2: Exercise & Supplements
    <div key="exercise" className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">How often do you exercise?</h2>
        <div className="grid grid-cols-2 gap-2">
          {exerciseOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setExerciseFrequency(opt)}
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
          {supplementOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSupplementExperience(opt)}
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
    </div>,

    // Step 3: Focus areas
    <div key="focus" className="space-y-4">
      <h2 className="text-xl font-semibold">
        What topics interest you most?
      </h2>
      <p className="text-muted-foreground text-sm">
        We&apos;ll prioritize protocols in these areas
      </p>
      <div className="grid grid-cols-2 gap-2">
        {focusAreas.map((area) => (
          <button
            key={area}
            onClick={() => toggleFocus(area)}
            className={`p-3 rounded-lg border text-sm text-left transition-colors ${
              selectedFocusAreas.includes(area)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-foreground/30"
            }`}
          >
            {area}
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <CardTitle>
            Step {step + 1} of {steps.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps[step]}
          <div className="flex gap-3">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Saving..." : "Start Exploring"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
