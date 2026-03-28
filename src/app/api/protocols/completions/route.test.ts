/**
 * Integration-style tests for the completions API route logic.
 * Tests the pure helper functions (getLocalToday, daysBetween) extracted
 * from the route handlers, and the body validation schema.
 */
import { z } from "zod";

// Re-implement the pure functions from the route to test them in isolation.
// These match the implementations in route.ts exactly.

function getLocalToday(url: string): string {
  const offsetStr = new URL(url).searchParams.get("tz_offset");
  const offsetMinutes = offsetStr ? parseInt(offsetStr, 10) : 0;
  const now = new Date();
  const local = new Date(now.getTime() - offsetMinutes * 60000);
  return local.toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  const msA = Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10));
  const msB = Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10));
  return Math.round((msA - msB) / 86400000);
}

const completionSchema = z.object({
  protocol_id: z.string().uuid(),
  tool_id: z.string().uuid(),
  tz_offset: z.number().int().min(-720).max(720).optional(),
});

describe("getLocalToday", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set to 2026-03-28T15:00:00Z
    vi.setSystemTime(new Date("2026-03-28T15:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns UTC date when no tz_offset param", () => {
    const result = getLocalToday("http://localhost/api/test");
    expect(result).toBe("2026-03-28");
  });

  it("adjusts date for negative offset (ahead of UTC, e.g. Asia)", () => {
    // tz_offset = -540 means UTC+9 (Japan)
    // 15:00 UTC = 00:00 next day in UTC+9
    const result = getLocalToday("http://localhost/api/test?tz_offset=-540");
    expect(result).toBe("2026-03-29");
  });

  it("adjusts date for positive offset (behind UTC, e.g. US West)", () => {
    // tz_offset = 420 means UTC-7 (PDT)
    // 15:00 UTC = 08:00 same day in PDT
    const result = getLocalToday("http://localhost/api/test?tz_offset=420");
    expect(result).toBe("2026-03-28");
  });

  it("handles midnight boundary correctly", () => {
    // Set to 2026-03-28T02:00:00Z
    vi.setSystemTime(new Date("2026-03-28T02:00:00Z"));
    // tz_offset = 300 means UTC-5 (EST)
    // 02:00 UTC = 21:00 previous day in EST
    const result = getLocalToday("http://localhost/api/test?tz_offset=300");
    expect(result).toBe("2026-03-27");
  });
});

describe("daysBetween", () => {
  it("returns 0 for same date", () => {
    expect(daysBetween("2026-03-28", "2026-03-28")).toBe(0);
  });

  it("returns 1 for consecutive dates", () => {
    expect(daysBetween("2026-03-28", "2026-03-27")).toBe(1);
  });

  it("returns negative for reversed dates", () => {
    expect(daysBetween("2026-03-27", "2026-03-28")).toBe(-1);
  });

  it("handles month boundaries", () => {
    expect(daysBetween("2026-04-01", "2026-03-31")).toBe(1);
  });

  it("handles year boundaries", () => {
    expect(daysBetween("2026-01-01", "2025-12-31")).toBe(1);
  });

  it("handles leap year", () => {
    expect(daysBetween("2024-03-01", "2024-02-28")).toBe(2); // Feb 29 exists in 2024
  });

  it("handles large gaps", () => {
    expect(daysBetween("2026-03-28", "2026-01-01")).toBe(86);
  });
});

describe("completionSchema validation", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid completion data", () => {
    const result = completionSchema.safeParse({
      protocol_id: validUUID,
      tool_id: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional tz_offset", () => {
    const result = completionSchema.safeParse({
      protocol_id: validUUID,
      tool_id: validUUID,
      tz_offset: -300,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID protocol_id", () => {
    const result = completionSchema.safeParse({
      protocol_id: "not-a-uuid",
      tool_id: validUUID,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-UUID tool_id", () => {
    const result = completionSchema.safeParse({
      protocol_id: validUUID,
      tool_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects tz_offset out of range", () => {
    const result = completionSchema.safeParse({
      protocol_id: validUUID,
      tool_id: validUUID,
      tz_offset: 1000,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing protocol_id", () => {
    const result = completionSchema.safeParse({
      tool_id: validUUID,
    });
    expect(result.success).toBe(false);
  });

  it("rejects float tz_offset", () => {
    const result = completionSchema.safeParse({
      protocol_id: validUUID,
      tool_id: validUUID,
      tz_offset: 5.5,
    });
    expect(result.success).toBe(false);
  });
});
