import type { SupabaseClient } from "@supabase/supabase-js";

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;

/**
 * Check if a user has exceeded the rate limit using Supabase as shared state.
 * Counts recent chat_messages from the user in the last minute.
 * Works across serverless instances — no in-memory state.
 *
 * Returns null if allowed, or a Response with 429 if rate-limited.
 */
export async function checkRateLimit(
  userId: string,
  supabase: SupabaseClient
): Promise<Response | null> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  const { count } = await supabase
    .from("chat_messages")
    .select("*, chat_sessions!inner(user_id)", { count: "exact", head: true })
    .eq("chat_sessions.user_id", userId)
    .eq("role", "user")
    .gte("created_at", since);

  if ((count ?? 0) >= MAX_REQUESTS) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      }
    );
  }

  return null;
}
