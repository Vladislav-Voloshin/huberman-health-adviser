"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TourStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='protocols-nav']",
    title: "Browse Protocols",
    description:
      "Explore science-based health protocols from the Huberman Lab. Each one comes with actionable tools you can track daily.",
    position: "top",
  },
  {
    target: "[data-tour='chat-nav']",
    title: "Ask the AI Coach",
    description:
      "Chat with an AI trained on Huberman Lab content. Ask about sleep, supplements, exercise, or any health topic.",
    position: "top",
  },
  {
    target: "[data-tour='profile-nav']",
    title: "Track Your Progress",
    description:
      "View your stats, streaks, achievements, and active protocols all in one place.",
    position: "top",
  },
];

const STORAGE_KEY = "craftwell_tour_completed";

export function TourOverlay({ show }: { show?: boolean }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (show && !localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const positionTooltip = useCallback(() => {
    if (!visible) return;
    const currentStep = TOUR_STEPS[step];
    const el = document.querySelector(currentStep.target);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const style: React.CSSProperties = { position: "fixed" };

    switch (currentStep.position) {
      case "top":
        style.bottom = `${window.innerHeight - rect.top + 12}px`;
        style.left = `${rect.left + rect.width / 2}px`;
        style.transform = "translateX(-50%)";
        break;
      case "bottom":
        style.top = `${rect.bottom + 12}px`;
        style.left = `${rect.left + rect.width / 2}px`;
        style.transform = "translateX(-50%)";
        break;
      case "left":
        style.top = `${rect.top + rect.height / 2}px`;
        style.right = `${window.innerWidth - rect.left + 12}px`;
        style.transform = "translateY(-50%)";
        break;
      case "right":
        style.top = `${rect.top + rect.height / 2}px`;
        style.left = `${rect.right + 12}px`;
        style.transform = "translateY(-50%)";
        break;
    }

    setTooltipStyle(style);
  }, [visible, step]);

  useEffect(() => {
    positionTooltip();
    window.addEventListener("resize", positionTooltip);
    return () => window.removeEventListener("resize", positionTooltip);
  }, [positionTooltip]);

  function handleNext() {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      completeTour();
    }
  }

  function completeTour() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  const currentStep = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 transition-opacity"
        onClick={completeTour}
      />

      {/* Highlight target element */}
      <HighlightRing selector={currentStep.target} />

      {/* Tooltip */}
      <div
        style={tooltipStyle}
        className={cn(
          "fixed z-[102] w-72 p-4 rounded-xl bg-background border border-border shadow-lg",
          "animate-in fade-in slide-in-from-bottom-2 duration-300"
        )}
      >
        <p className="font-semibold text-sm">{currentStep.title}</p>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          {currentStep.description}
        </p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  i === step ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={completeTour}>
              Skip
            </Button>
            <Button size="sm" className="text-xs h-7" onClick={handleNext}>
              {isLast ? "Got it!" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function HighlightRing({ selector }: { selector: string }) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    function update() {
      const el = document.querySelector(selector);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setStyle({
        position: "fixed",
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
        borderRadius: 12,
      });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [selector]);

  return (
    <div
      style={style}
      className="z-[101] ring-2 ring-primary ring-offset-2 ring-offset-background pointer-events-none"
    />
  );
}
