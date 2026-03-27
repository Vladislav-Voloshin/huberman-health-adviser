import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Authenticate the current request via Supabase session cookie.
 * Returns the authenticated user and a ready-to-use Supabase client,
 * or throws an AuthError that the caller can catch.
 */
export async function requireAuth(): Promise<{
  user: User;
  supabase: SupabaseClient;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError();
  }

  return { user, supabase };
}

/** Sentinel error thrown when no valid session exists. */
export class AuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AuthError";
  }
}

/** Consistent JSON error response. */
export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Catch-all handler: returns 401 for AuthError, 500 for everything else. */
export function handleApiError(err: unknown) {
  if (err instanceof AuthError) {
    return apiError("Unauthorized", 401);
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error("[API Error]", message);
  return apiError(
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : message,
    500
  );
}
