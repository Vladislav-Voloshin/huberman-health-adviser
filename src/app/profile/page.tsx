import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileView } from "@/components/profile/profile-view";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: survey } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: userProtocols } = await supabase
    .from("user_protocols")
    .select("*, protocols(*)")
    .eq("user_id", user.id)
    .eq("is_active", true);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <ProfileView
          profile={profile}
          survey={survey}
          activeProtocols={userProtocols || []}
        />
      </div>
    </AppShell>
  );
}
