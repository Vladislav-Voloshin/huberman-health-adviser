/**
 * Create E2E test user in Supabase
 * Run: npx tsx scripts/create-test-user.ts
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });

import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const email = "e2e-test@craftwell.app";
  const password = "TestPass123!";

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  if (existing) {
    console.log("Test user already exists:", existing.id);

    // Ensure onboarding is completed so tests can access app routes
    const { error } = await supabase
      .from("users")
      .update({ onboarding_completed: true })
      .eq("id", existing.id);

    if (error) {
      console.log("Note: couldn't update onboarding flag:", error.message);
    } else {
      console.log("Onboarding flag set to true");
    }
    return;
  }

  // Create new user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error("Error creating test user:", error.message);
    return;
  }

  console.log("Test user created:", data.user.id);

  // Mark onboarding as completed
  await supabase.from("users").upsert({
    id: data.user.id,
    email,
    onboarding_completed: true,
  });

  // Create survey response
  await supabase.from("survey_responses").upsert({
    user_id: data.user.id,
    health_goals: ["Better Sleep", "More Energy"],
    sleep_quality: 6,
    stress_level: 5,
    exercise_frequency: "3-4x per week",
    supplement_experience: "Some experience",
    focus_areas: ["Sleep", "Nutrition"],
  });

  console.log("Test user setup complete with onboarding data");
}

main().catch(console.error);
