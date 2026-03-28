/**
 * Tests for completions API route — date utils and schemas imported from source.
 */
import { getLocalDate, daysBetween } from "@/lib/api/date-utils";
import { completionSchema } from "@/lib/api/schemas";

describe("getLocalDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28T15:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns UTC date when no offset", () => {
    expect(getLocalDate(0)).toBe("2026-03-28");
  });

  it("adjusts date for negative offset (ahead of UTC, e.g. Asia)", () => {
    expect(getLocalDate(-540)).toBe("2026-03-29");
  });

  it("adjusts date for positive offset (behind UTC, e.g. US West)", () => {
    expect(getLocalDate(420)).toBe("2026-03-28");
  });

  it("handles midnight boundary correctly", () => {
    vi.setSystemTime(new Date("2026-03-28T02:00:00Z"));
    expect(getLocalDate(300)).toBe("2026-03-27");
  });

  it("returns same date with default offset", () => {
    expect(getLocalDate()).toBe("2026-03-28");
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
    expect(daysBetween("2024-03-01", "2024-02-28")).toBe(2);
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
