import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/helpers";
import { getRequestId } from "@/lib/api/request-id";

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const { user, supabase } = await requireAuth();

    // Get all completions with protocol and tool info
    const { data: completions } = await supabase
      .from("protocol_completions")
      .select("completed_date, protocol_id, tool_id, protocols(title), protocol_tools(title)")
      .eq("user_id", user.id)
      .order("completed_date", { ascending: false });

    if (!completions || completions.length === 0) {
      const csv = "Date,Protocol,Tool,Completed\n";
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="craftwell-progress-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    const rows = completions.map((c) => {
      const protocol = (c.protocols as unknown as { title: string })?.title || "Unknown";
      const tool = (c.protocol_tools as unknown as { title: string })?.title || "Unknown";
      // Escape CSV fields that might contain commas or quotes
      const escapeField = (s: string) => {
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };
      return `${c.completed_date},${escapeField(protocol)},${escapeField(tool)},Yes`;
    });

    const csv = ["Date,Protocol,Tool,Completed", ...rows].join("\n");
    const today = new Date().toISOString().split("T")[0];

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="craftwell-progress-${today}.csv"`,
      },
    });
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
