import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProtocolDetail } from "@/components/protocols/protocol-detail";

export default async function ProtocolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: protocol } = await supabase
    .from("protocols")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!protocol) notFound();

  const { data: tools } = await supabase
    .from("protocol_tools")
    .select("*")
    .eq("protocol_id", protocol.id)
    .order("effectiveness_rank");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isActive = false;
  if (user) {
    const { data: userProtocol } = await supabase
      .from("user_protocols")
      .select("is_active")
      .eq("user_id", user.id)
      .eq("protocol_id", protocol.id)
      .single();
    isActive = userProtocol?.is_active ?? false;
  }

  return (
    <AppShell>
      <ProtocolDetail
        protocol={protocol}
        tools={tools || []}
        isActive={isActive}
        isLoggedIn={!!user}
      />
    </AppShell>
  );
}
