import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ChatInterface } from "@/components/chat/chat-interface";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <AppShell>
      <ChatInterface userId={user.id} sessions={sessions || []} />
    </AppShell>
  );
}
