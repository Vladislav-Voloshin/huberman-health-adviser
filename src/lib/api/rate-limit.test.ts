import { checkRateLimit } from "./rate-limit";
import type { SupabaseClient } from "@supabase/supabase-js";

function mockSupabase(count: number | null): SupabaseClient {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            gte: () => Promise.resolve({ count }),
          }),
        }),
      }),
    }),
  } as unknown as SupabaseClient;
}

describe("checkRateLimit", () => {
  it("returns null when under the limit", async () => {
    const supabase = mockSupabase(5);
    const result = await checkRateLimit("user-1", supabase);
    expect(result).toBeNull();
  });

  it("returns null when count is 0", async () => {
    const supabase = mockSupabase(0);
    const result = await checkRateLimit("user-1", supabase);
    expect(result).toBeNull();
  });

  it("returns null when count is null", async () => {
    const supabase = mockSupabase(null);
    const result = await checkRateLimit("user-1", supabase);
    expect(result).toBeNull();
  });

  it("returns 429 when at the limit (20 requests)", async () => {
    const supabase = mockSupabase(20);
    const result = await checkRateLimit("user-1", supabase);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(429);
    const body = await result!.json();
    expect(body.error).toContain("Too many requests");
  });

  it("returns 429 when over the limit", async () => {
    const supabase = mockSupabase(50);
    const result = await checkRateLimit("user-1", supabase);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(429);
  });

  it("includes Retry-After header when rate limited", async () => {
    const supabase = mockSupabase(25);
    const result = await checkRateLimit("user-1", supabase);
    expect(result!.headers.get("Retry-After")).toBe("60");
  });

  it("returns just under the limit", async () => {
    const supabase = mockSupabase(19);
    const result = await checkRateLimit("user-1", supabase);
    expect(result).toBeNull();
  });
});
