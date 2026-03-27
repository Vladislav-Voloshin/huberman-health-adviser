import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError, handleApiError } from "@/lib/api/helpers";

/** Get today's date in the user's local timezone using tz_offset (minutes). */
function getLocalToday(request: NextRequest): string {
  const offsetStr = new URL(request.url).searchParams.get("tz_offset");
  const offsetMinutes = offsetStr ? parseInt(offsetStr, 10) : 0;
  const now = new Date();
  const local = new Date(now.getTime() - offsetMinutes * 60000);
  return local.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth();

    const { searchParams } = new URL(request.url);
    const protocolId = searchParams.get("protocol_id");
    const type = searchParams.get("type"); // "today" | "streaks"

    if (!protocolId) {
      return apiError("protocol_id required", 400);
    }

    if (type === "streaks") {
      return getStreaks(user.id, protocolId, supabase, request);
    }

    // Default: get today's completions (using user's local date)
    const today = getLocalToday(request);

    const { data: completions } = await supabase
      .from("protocol_completions")
      .select("tool_id")
      .eq("user_id", user.id)
      .eq("protocol_id", protocolId)
      .eq("completed_date", today);

    return NextResponse.json({
      completed_tool_ids: (completions || []).map((c) => c.tool_id),
      date: today,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth();

    const { protocol_id, tool_id, tz_offset } = await request.json();

    if (!protocol_id || !tool_id) {
      return apiError("protocol_id and tool_id required", 400);
    }

    // Use client-provided timezone offset for local date
    const offsetMinutes = typeof tz_offset === "number" ? tz_offset : 0;
    const now = new Date();
    const local = new Date(now.getTime() - offsetMinutes * 60000);
    const today = local.toISOString().split("T")[0];

    // Check if already completed today
    const { data: existing } = await supabase
      .from("protocol_completions")
      .select("id")
      .eq("user_id", user.id)
      .eq("protocol_id", protocol_id)
      .eq("tool_id", tool_id)
      .eq("completed_date", today)
      .maybeSingle();

    if (existing) {
      // Uncomplete (toggle off)
      await supabase.from("protocol_completions").delete().eq("id", existing.id);
      return NextResponse.json({ status: "uncompleted" });
    }

    // Complete (toggle on)
    const { error } = await supabase.from("protocol_completions").insert({
      user_id: user.id,
      protocol_id,
      tool_id,
      completed_date: today,
    });

    if (error) {
      return apiError(error.message, 500);
    }

    return NextResponse.json({ status: "completed" });
  } catch (err) {
    return handleApiError(err);
  }
}

/** Calculate streak data for a protocol. */
async function getStreaks(
  userId: string,
  protocolId: string,
  supabase: import("@supabase/supabase-js").SupabaseClient,
  request: NextRequest
) {
  const { count: totalTools } = await supabase
    .from("protocol_tools")
    .select("id", { count: "exact", head: true })
    .eq("protocol_id", protocolId);

  const toolCount = totalTools ?? 0;

  const { data: completions } = await supabase
    .from("protocol_completions")
    .select("completed_date")
    .eq("user_id", userId)
    .eq("protocol_id", protocolId)
    .order("completed_date", { ascending: false });

  if (!completions || completions.length === 0 || toolCount === 0) {
    return NextResponse.json({ streak: 0, longest_streak: 0, total_days: 0 });
  }

  // Count completions per date
  const dateCounts = new Map<string, number>();
  for (const c of completions) {
    dateCounts.set(c.completed_date, (dateCounts.get(c.completed_date) || 0) + 1);
  }

  // Get fully completed dates (all tools done)
  const fullDates = [...dateCounts.entries()]
    .filter(([, count]) => count >= toolCount)
    .map(([date]) => date)
    .sort()
    .reverse();

  if (fullDates.length === 0) {
    return NextResponse.json({ streak: 0, longest_streak: 0, total_days: 0 });
  }

  // Calculate current streak (using user's local date)
  let streak = 0;
  const today = getLocalToday(request);
  const yesterdayDate = new Date(today + "T12:00:00Z");
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  if (fullDates[0] === today || fullDates[0] === yesterday) {
    streak = 1;
    for (let i = 1; i < fullDates.length; i++) {
      const prev = new Date(fullDates[i - 1]);
      const curr = new Date(fullDates[i]);
      const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let currentRun = 1;
  for (let i = 1; i < fullDates.length; i++) {
    const prev = new Date(fullDates[i - 1]);
    const curr = new Date(fullDates[i]);
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
    if (diffDays === 1) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  return NextResponse.json({
    streak,
    longest_streak: longestStreak,
    total_days: fullDates.length,
  });
}
