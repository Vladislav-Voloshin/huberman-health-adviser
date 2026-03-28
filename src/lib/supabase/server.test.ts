import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  coreEnv: vi.fn(() => ({
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  })),
}));

describe("createClient (supabase server)", () => {
  const mockGetAll = vi.fn().mockReturnValue([{ name: "sb-token", value: "abc" }]);
  const mockSet = vi.fn();

  const mockCookieStore = {
    getAll: mockGetAll,
    set: mockSet,
  };

  beforeEach(async () => {
    vi.resetModules();
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as never);
  });

  it("calls createServerClient with the correct URL and anon key", async () => {
    const { createServerClient } = await import("@supabase/ssr");
    const mockedCreate = vi.mocked(createServerClient);
    mockedCreate.mockReturnValue({ auth: {} } as never);

    const { createClient } = await import("./server");
    await createClient();

    expect(mockedCreate).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key",
      expect.objectContaining({ cookies: expect.any(Object) }),
    );
  });

  it("returns the client produced by createServerClient", async () => {
    const fakeClient = { auth: { getUser: vi.fn() } };
    const { createServerClient } = await import("@supabase/ssr");
    vi.mocked(createServerClient).mockReturnValue(fakeClient as never);

    const { createClient } = await import("./server");
    const client = await createClient();
    expect(client).toBe(fakeClient);
  });

  it("passes a cookies adapter with getAll forwarding to the cookie store", async () => {
    let capturedAdapter: { getAll: () => unknown } | undefined;
    const { createServerClient } = await import("@supabase/ssr");
    vi.mocked(createServerClient).mockImplementation((_url, _key, options) => {
      capturedAdapter = options.cookies as typeof capturedAdapter;
      return { auth: {} } as never;
    });

    const { createClient } = await import("./server");
    await createClient();

    expect(capturedAdapter).toBeDefined();
    const result = capturedAdapter!.getAll();
    expect(result).toEqual([{ name: "sb-token", value: "abc" }]);
  });

  it("setAll calls cookieStore.set for each cookie", async () => {
    let capturedAdapter:
      | {
          setAll: (
            cookies: Array<{ name: string; value: string; options?: object }>,
          ) => void;
        }
      | undefined;
    const { createServerClient } = await import("@supabase/ssr");
    vi.mocked(createServerClient).mockImplementation((_url, _key, options) => {
      capturedAdapter = options.cookies as typeof capturedAdapter;
      return { auth: {} } as never;
    });

    const { createClient } = await import("./server");
    await createClient();

    const cookiesToSet = [
      { name: "sb-auth-token", value: "token123", options: { httpOnly: true } },
    ];
    capturedAdapter!.setAll(cookiesToSet);
    expect(mockSet).toHaveBeenCalledWith("sb-auth-token", "token123", {
      httpOnly: true,
    });
  });

  it("setAll swallows errors thrown from Server Component context", async () => {
    const { cookies } = await import("next/headers");
    const throwingCookieStore = {
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn().mockImplementation(() => {
        throw new Error("Cannot set cookies in RSC");
      }),
    };
    vi.mocked(cookies).mockResolvedValue(throwingCookieStore as never);

    let capturedAdapter:
      | {
          setAll: (
            cookies: Array<{ name: string; value: string; options?: object }>,
          ) => void;
        }
      | undefined;
    const { createServerClient } = await import("@supabase/ssr");
    vi.mocked(createServerClient).mockImplementation((_url, _key, options) => {
      capturedAdapter = options.cookies as typeof capturedAdapter;
      return { auth: {} } as never;
    });

    const { createClient } = await import("./server");
    await createClient();

    expect(() =>
      capturedAdapter!.setAll([{ name: "x", value: "y" }]),
    ).not.toThrow();
  });
});
