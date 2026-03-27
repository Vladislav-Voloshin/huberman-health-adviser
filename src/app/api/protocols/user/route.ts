import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError, handleApiError } from "@/lib/api/helpers";
import { getRequestId } from "@/lib/api/request-id";

export async function GET() {
  try {
    const { user, supabase } = await requireAuth();

    const { data: userProtocols } = await supabase
      .from("user_protocols")
      .select("*, protocols(id, title, slug, category, description, difficulty, time_commitment)")
      .eq("user_id", user.id);

    return NextResponse.json({ protocols: userProtocols || [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const { user, supabase } = await requireAuth();

    const { protocol_id, action } = await request.json();

    if (!protocol_id || !action) {
      return apiError("protocol_id and action required", 400);
    }

    switch (action) {
      case "activate": {
        const { error } = await supabase.from("user_protocols").upsert(
          {
            user_id: user.id,
            protocol_id,
            is_active: true,
          },
          { onConflict: "user_id,protocol_id" }
        );
        if (error) return apiError(error.message, 500);
        return NextResponse.json({ status: "activated" });
      }

      case "deactivate": {
        const { error } = await supabase
          .from("user_protocols")
          .update({ is_active: false })
          .eq("user_id", user.id)
          .eq("protocol_id", protocol_id);
        if (error) return apiError(error.message, 500);
        return NextResponse.json({ status: "deactivated" });
      }

      case "remove": {
        const { error } = await supabase
          .from("user_protocols")
          .delete()
          .eq("user_id", user.id)
          .eq("protocol_id", protocol_id);
        if (error) return apiError(error.message, 500);
        return NextResponse.json({ status: "removed" });
      }

      default:
        return apiError("Invalid action", 400);
    }
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
