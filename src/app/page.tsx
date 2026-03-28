import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Brain,
  Dumbbell,
  Heart,
  Apple,
  Zap,
  Snowflake,
  Sun,
  Target,
  Smile,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const categories: { icon: LucideIcon; label: string; accent: string }[] = [
  { icon: Moon, label: "Sleep", accent: "text-indigo-400" },
  { icon: Brain, label: "Focus", accent: "text-amber-400" },
  { icon: Dumbbell, label: "Exercise", accent: "text-emerald-400" },
  { icon: Heart, label: "Stress", accent: "text-rose-400" },
  { icon: Apple, label: "Nutrition", accent: "text-green-400" },
  { icon: Zap, label: "Hormones", accent: "text-yellow-400" },
  { icon: Snowflake, label: "Cold/Heat", accent: "text-cyan-400" },
  { icon: Sun, label: "Light", accent: "text-orange-400" },
  { icon: Target, label: "Motivation", accent: "text-purple-400" },
  { icon: Smile, label: "Mental Health", accent: "text-pink-400" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border/40 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              C
            </div>
            <span className="font-semibold text-lg">Craftwell</span>
          </div>
          <Link href="/auth">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Science-Based Health Protocols
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Evidence-based health tools ranked by effectiveness. Start with
            what works most, build your optimal routine step by step.
          </p>
          <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
            <Link href="/auth">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/protocols">
              <Button variant="outline" size="lg">
                Browse Protocols
              </Button>
            </Link>
          </div>

          {/* Categories preview */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/30"
                >
                  <Icon className={`w-5 h-5 ${cat.accent}`} />
                  <span className="text-xs text-muted-foreground">
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>
            Protocols sourced from peer-reviewed research and expert analysis.
            Not medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
