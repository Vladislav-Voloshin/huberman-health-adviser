import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StreaksResponse as StreakData } from "@/lib/types/database";

export function ProtocolHeader({
  title,
  description,
  difficulty,
  timeCommitment,
  streakData,
  isLoggedIn,
  isActive,
  loading,
  onToggleProtocol,
}: {
  title: string;
  description: string;
  difficulty: string;
  timeCommitment: string;
  streakData: StreakData | null;
  isLoggedIn: boolean;
  isActive: boolean;
  loading: boolean;
  onToggleProtocol: () => void;
}) {
  return (
    <div className="space-y-2">
      <Link href="/protocols" className="text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to Protocols
      </Link>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <div className="flex gap-2 flex-wrap items-center">
        <Badge variant="outline">{difficulty}</Badge>
        {timeCommitment && <Badge variant="outline">{timeCommitment}</Badge>}
        {streakData && streakData.streak > 0 && (
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
          >
            {streakData.streak} day streak
          </Badge>
        )}
      </div>
      {isLoggedIn && (
        <Button onClick={onToggleProtocol} disabled={loading} variant={isActive ? "outline" : "default"} className="mt-2">
          {loading ? "..." : isActive ? "Remove from My Protocols" : "Add to My Protocols"}
        </Button>
      )}
    </div>
  );
}
