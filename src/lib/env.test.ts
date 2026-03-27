import { describe, it, expect, vi, beforeEach } from "vitest";

// We can't import the cached coreEnv/serverEnv directly because they cache
// on first call. Instead we test the validation logic by importing the module
// freshly each time.

describe("env validation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("coreEnv() throws when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
    const { coreEnv } = await import("./env");
    expect(() => coreEnv()).toThrow("Missing or invalid environment variables (core)");
  });

  it("coreEnv() throws when URL is not a valid URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
    const { coreEnv } = await import("./env");
    expect(() => coreEnv()).toThrow("core");
  });

  it("coreEnv() succeeds with valid variables", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiJ9.test");
    const { coreEnv } = await import("./env");
    const env = coreEnv();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://abc.supabase.co");
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("eyJhbGciOiJIUzI1NiJ9.test");
  });

  it("serverEnv() throws when AI keys are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const { serverEnv } = await import("./env");
    expect(() => serverEnv()).toThrow("server");
  });

  it("serverEnv() defaults PINECONE_INDEX to 'craftwell' when not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "sk");
    vi.stubEnv("ANTHROPIC_API_KEY", "ak");
    vi.stubEnv("PINECONE_API_KEY", "pk");
    // Delete PINECONE_INDEX so Zod .default() kicks in
    delete process.env.PINECONE_INDEX;
    vi.stubEnv("VOYAGE_API_KEY", "vk");
    vi.stubEnv("YOUTUBE_API_KEY", "yk");
    vi.stubEnv("ADMIN_API_KEY", "admk");
    const { serverEnv } = await import("./env");
    const env = serverEnv();
    expect(env.PINECONE_INDEX).toBe("craftwell");
  });
});
