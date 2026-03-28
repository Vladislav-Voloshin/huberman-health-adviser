import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProtocolDetail } from "@/components/protocols/protocol-detail";
import { RelatedProtocols } from "@/components/protocols/related-protocols";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: protocol } = await supabase
    .from("protocols")
    .select("title, description")
    .eq("slug", slug)
    .single();

  if (!protocol) return { title: "Protocol Not Found — Craftwell" };

  return {
    title: `${protocol.title} — Craftwell`,
    description: protocol.description,
  };
}

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
      .maybeSingle();
    isActive = userProtocol?.is_active ?? false;
  }

  // Fetch related protocols (same category, excluding current)
  const { data: relatedProtocols } = await supabase
    .from("protocols")
    .select("*")
    .eq("category", protocol.category)
    .neq("slug", slug)
    .order("effectiveness_rank")
    .limit(4);

  return (
    <AppShell>
      <ProtocolDetail
        protocol={protocol}
        tools={tools || []}
        isActive={isActive}
        isLoggedIn={!!user}
      />
      <div className="max-w-3xl mx-auto px-4 pb-6">
        <RelatedProtocols protocols={relatedProtocols || []} />
      </div>
    </AppShell>
  );
}
