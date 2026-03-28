import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { WeeklyDashboard } from "@/components/protocols/weekly-dashboard";

export const metadata: Metadata = {
  title: "Progress Dashboard — Craftwell",
  description: "Track your weekly protocol adherence and streaks.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  return (
    <AppShell>
      <WeeklyDashboard />
    </AppShell>
  );
}
