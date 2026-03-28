import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError, handleApiError } from "@/lib/api/helpers";
import { getRequestId } from "@/lib/api/request-id";

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const { user, supabase } = await requireAuth();

    const query = new URL(request.url).searchParams.get("q")?.trim();
    if (!query || query.length < 2) {
      return apiError("Query must be at least 2 characters", 400);
    }

    // Search messages across all user's sessions using ilike
    const pattern = `%${query}%`;

    const { data: messages } = await supabase
      .from("chat_messages")
      .select("id, content, role, created_at, session_id, chat_sessions!inner(id, title, user_id)")
      .eq("chat_sessions.user_id", user.id)
      .ilike("content", pattern)
      .order("created_at", { ascending: false })
      .limit(20);

    const results = (messages || []).map((m) => {
      const session = m.chat_sessions as unknown as { id: string; title: string };
      // Extract a snippet around the match
      const lowerContent = m.content.toLowerCase();
      const matchIdx = lowerContent.indexOf(query.toLowerCase());
      const start = Math.max(0, matchIdx - 40);
      const end = Math.min(m.content.length, matchIdx + query.length + 40);
      const snippet =
        (start > 0 ? "..." : "") +
        m.content.slice(start, end) +
        (end < m.content.length ? "..." : "");

      return {
        message_id: m.id,
        session_id: m.session_id,
        session_title: session?.title || "Untitled",
        role: m.role,
        snippet,
        created_at: m.created_at,
      };
    });

    return NextResponse.json({ results });
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
