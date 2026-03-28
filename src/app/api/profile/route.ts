import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError, handleApiError, parseBody } from "@/lib/api/helpers";
import { getRequestId } from "@/lib/api/request-id";
import { z } from "zod";

const profileUpdateSchema = z.object({
  profile: z.object({
    display_name: z.string().max(100).nullish(),
    first_name: z.string().max(50).nullish(),
    last_name: z.string().max(50).nullish(),
    age: z.number().int().min(1).max(150).nullish(),
  }).optional(),
  survey: z.object({
    health_goals: z.array(z.string()).optional(),
    sleep_quality: z.number().int().min(1).max(10).optional(),
    exercise_frequency: z.string().optional(),
    stress_level: z.number().int().min(1).max(10).optional(),
    supplement_experience: z.string().nullish(),
    focus_areas: z.array(z.string()).optional(),
  }).optional(),
});

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
  const requestId = getRequestId(request);
  try {
    const { user, supabase } = await requireAuth();

    const body = await parseBody(request, profileUpdateSchema);
    if (body instanceof Response) return body;

    const { profile: profileData, survey: surveyData } = body;

    const results: { profile?: string; survey?: string } = {};

    // Update users table — Zod already strips unknown fields
    if (profileData && Object.keys(profileData).length > 0) {
      const { error } = await supabase
        .from("users")
        .update(profileData)
        .eq("id", user.id);

      if (error) {
        // If columns don't exist yet, try without the new columns
        if (error.message.includes("does not exist") && profileData.display_name !== undefined) {
          const { error: fallbackErr } = await supabase
            .from("users")
            .update({ display_name: profileData.display_name })
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

    // Update survey_responses — Zod already strips unknown fields
    if (surveyData && Object.keys(surveyData).length > 0) {
      const { error } = await supabase
        .from("survey_responses")
        .upsert({ user_id: user.id, ...surveyData }, { onConflict: "user_id" });

      if (error) {
        return apiError(error.message, 500);
      }
      results.survey = "updated";
    }

    return NextResponse.json({ status: "ok", ...results });
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
