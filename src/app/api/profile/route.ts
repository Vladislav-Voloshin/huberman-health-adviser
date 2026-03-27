import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError, handleApiError } from "@/lib/api/helpers";

export async function GET() {
  try {
    const { user, supabase } = await requireAuth();

    const [{ data: profile }, { data: survey }] = await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase.from("survey_responses").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

    return NextResponse.json({ profile, survey });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth();

    const body = await request.json();
    const { profile: profileData, survey: surveyData } = body;

    const results: { profile?: string; survey?: string } = {};

    // Update users table (display_name, first_name, last_name, age)
    if (profileData) {
      const allowedFields = ["display_name", "first_name", "last_name", "age"];
      const updateData: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (field in profileData) {
          updateData[field] = profileData[field];
        }
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", user.id);

        if (error) {
          // If columns don't exist yet, try without the new columns
          if (error.message.includes("does not exist")) {
            const fallbackData: Record<string, unknown> = {};
            if ("display_name" in updateData) fallbackData.display_name = updateData.display_name;

            const { error: fallbackErr } = await supabase
              .from("users")
              .update(fallbackData)
              .eq("id", user.id);

            results.profile = fallbackErr
              ? fallbackErr.message
              : "updated (some fields pending migration)";
          } else {
            return apiError(error.message, 500);
          }
        } else {
          results.profile = "updated";
        }
      }
    }

    // Update survey_responses
    if (surveyData) {
      const allowedSurveyFields = [
        "health_goals", "sleep_quality", "exercise_frequency",
        "stress_level", "supplement_experience", "focus_areas",
      ];
      const updateData: Record<string, unknown> = { user_id: user.id };
      for (const field of allowedSurveyFields) {
        if (field in surveyData) {
          updateData[field] = surveyData[field];
        }
      }

      const { error } = await supabase
        .from("survey_responses")
        .upsert(updateData, { onConflict: "user_id" });

      if (error) {
        return apiError(error.message, 500);
      }
      results.survey = "updated";
    }

    return NextResponse.json({ status: "ok", ...results });
  } catch (err) {
    return handleApiError(err);
  }
}
