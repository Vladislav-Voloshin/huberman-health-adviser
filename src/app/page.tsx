import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border/40 px-6 py-4">
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
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Science-Based Health Protocols
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Evidence-based health tools ranked by effectiveness. Start with
            what works most, build your optimal routine step by step.
          </p>
          <div className="flex gap-4 justify-center">
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
            {[
              { icon: "🌙", label: "Sleep" },
              { icon: "🧠", label: "Focus" },
              { icon: "💪", label: "Exercise" },
              { icon: "❤️", label: "Stress" },
              { icon: "🍎", label: "Nutrition" },
              { icon: "⚡", label: "Hormones" },
              { icon: "🧊", label: "Cold/Heat" },
              { icon: "☀️", label: "Light" },
              { icon: "🎯", label: "Motivation" },
              { icon: "😊", label: "Mental Health" },
            ].map((cat) => (
              <div
                key={cat.label}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/30"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-muted-foreground">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-4">
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
