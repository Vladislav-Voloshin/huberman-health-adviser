"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  ClipboardList,
  BarChart3,
  MessageCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";

const TourOverlay = dynamic(
  () => import("@/components/tour/tour-overlay").then((m) => m.TourOverlay),
  { ssr: false }
);

const navItems: {
  href: string;
  label: string;
  icon: LucideIcon;
  tourId?: string;
}[] = [
  { href: "/protocols", label: "Protocols", icon: ClipboardList, tourId: "protocols-nav" },
  { href: "/protocols/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/chat", label: "Chat", icon: MessageCircle, tourId: "chat-nav" },
  { href: "/profile", label: "Profile", icon: User, tourId: "profile-nav" },
];

const emptySubscribe = () => () => {};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}

function getShowTour() {
  return new URLSearchParams(window.location.search).get("tour") === "1";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTour = useSyncExternalStore(
    emptySubscribe,
    getShowTour,
    () => false
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <header className="border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <Link href="/protocols" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
            C
          </div>
          <span className="font-semibold">Craftwell</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-16">{children}</main>

      {/* Onboarding tour */}
      <TourOverlay show={showTour} />

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-sm safe-area-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.tourId}
                className={cn(
                  "flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center rounded-lg text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-xs leading-none">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
