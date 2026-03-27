import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatTime, formatSessionDate } from "./utils";

describe("formatTime", () => {
  it("returns empty string for undefined input", () => {
    expect(formatTime()).toBe("");
  });

  it("returns a time string for a valid ISO date", () => {
    const result = formatTime("2026-03-27T14:30:00Z");
    // Locale-dependent, but should contain digits and a colon
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("formatSessionDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-27T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Today" for today\'s date', () => {
    expect(formatSessionDate("2026-03-27T10:00:00Z")).toBe("Today");
  });

  it('returns "Yesterday" for yesterday', () => {
    expect(formatSessionDate("2026-03-26T10:00:00Z")).toBe("Yesterday");
  });

  it('returns "Xd ago" for 2-6 days ago', () => {
    expect(formatSessionDate("2026-03-24T10:00:00Z")).toBe("3d ago");
  });

  it("returns formatted date for 7+ days ago", () => {
    const result = formatSessionDate("2026-03-10T10:00:00Z");
    expect(result).toMatch(/Mar\s+10/);
  });
});
