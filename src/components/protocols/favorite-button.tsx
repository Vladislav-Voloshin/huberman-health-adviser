"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  protocolId,
  initialFavorited = false,
  isLoggedIn = false,
  size = "sm",
  onToggle,
}: {
  protocolId: string;
  initialFavorited?: boolean;
  isLoggedIn?: boolean;
  size?: "sm" | "md";
  onToggle?: (protocolId: string, favorited: boolean) => void;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) return null;

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch("/api/protocols/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocol_id: protocolId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFavorited(data.favorited);
        onToggle?.(protocolId, data.favorited);
      }
    } finally {
      setLoading(false);
    }
  }

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "p-1.5 rounded-full transition-colors",
        "hover:bg-rose-500/10",
        loading && "opacity-50 cursor-not-allowed"
      )}
    >
      <Heart
        className={cn(
          iconSize,
          "transition-colors",
          favorited
            ? "fill-rose-500 text-rose-500"
            : "text-muted-foreground hover:text-rose-400"
        )}
      />
    </button>
  );
}
