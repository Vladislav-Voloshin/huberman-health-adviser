import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userProtocols } = await supabase
    .from("user_protocols")
    .select("*, protocols(id, title, slug, category, description, difficulty, time_commitment)")
    .eq("user_id", user.id);

  return NextResponse.json({ protocols: userProtocols || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { protocol_id, action } = await request.json();

  if (!protocol_id || !action) {
    return NextResponse.json(
      { error: "protocol_id and action required" },
      { status: 400 }
    );
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
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ status: "activated" });
    }

    case "deactivate": {
      const { error } = await supabase
        .from("user_protocols")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("protocol_id", protocol_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ status: "deactivated" });
    }

    case "remove": {
      const { error } = await supabase
        .from("user_protocols")
        .delete()
        .eq("user_id", user.id)
        .eq("protocol_id", protocol_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ status: "removed" });
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
