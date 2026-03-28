import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/helpers";
import { getRequestId } from "@/lib/api/request-id";

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const { user, supabase } = await requireAuth();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      // Verify the session belongs to the user
      const { data: session } = await supabase
        .from("chat_sessions")
        .select("id, user_id")
        .eq("id", sessionId)
        .single();

      if (!session || session.user_id !== user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      // Load messages for a specific session
      const { data: messages } = await supabase
        .from("chat_messages")
        .select("id, role, content, sources, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      return NextResponse.json({ messages: messages || [] });
    }

    // List all sessions
    const { data: sessions } = await supabase
      .from("chat_sessions")
      .select("id, title, protocol_id, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50);

    return NextResponse.json({ sessions: sessions || [] });
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
