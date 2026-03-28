import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, parseBody, handleApiError } from "@/lib/api/helpers";
import { getRequestId } from "@/lib/api/request-id";

const upsertSchema = z.object({
  protocol_id: z.string().uuid(),
  content: z.string().max(5000),
});

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const { user, supabase } = await requireAuth();
    const protocolId = new URL(request.url).searchParams.get("protocol_id");

    if (!protocolId) {
      return NextResponse.json({ error: "protocol_id required" }, { status: 400 });
    }

    const { data } = await supabase
      .from("protocol_notes")
      .select("id, content, updated_at")
      .eq("user_id", user.id)
      .eq("protocol_id", protocolId)
      .maybeSingle();

    return NextResponse.json({ note: data });
  } catch (err) {
    return handleApiError(err, requestId);
  }
}

export async function PUT(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const { user, supabase } = await requireAuth();
    const body = await parseBody(request, upsertSchema);
    if (body instanceof Response) return body;

    const { data, error } = await supabase
      .from("protocol_notes")
      .upsert(
        {
          user_id: user.id,
          protocol_id: body.protocol_id,
          content: body.content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,protocol_id" }
      )
      .select("id, content, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note: data });
  } catch (err) {
    return handleApiError(err, requestId);
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const { user, supabase } = await requireAuth();
    const protocolId = new URL(request.url).searchParams.get("protocol_id");

    if (!protocolId) {
      return NextResponse.json({ error: "protocol_id required" }, { status: 400 });
    }

    await supabase
      .from("protocol_notes")
      .delete()
      .eq("user_id", user.id)
      .eq("protocol_id", protocolId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
