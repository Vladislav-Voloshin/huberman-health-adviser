import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ChatInterface } from "@/components/chat/chat-interface";

export const metadata: Metadata = {
  title: "Chat — Craftwell",
  description: "Ask your AI health adviser about science-based protocols, supplements, and routines.",
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ protocol?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const params = await searchParams;

  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <AppShell>
      <ChatInterface
        userId={user.id}
        sessions={sessions || []}
        initialProtocolId={params.protocol}
      />
    </AppShell>
  );
}
