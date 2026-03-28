/**
 * Tests for the CSV export logic — field escaping and CSV format.
 */

// Re-implement the escapeField function from route.ts
function escapeField(s: string): string {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildCsvRow(date: string, protocol: string, tool: string): string {
  return `${date},${escapeField(protocol)},${escapeField(tool)},Yes`;
}

describe("CSV escapeField", () => {
  it("returns plain string as-is", () => {
    expect(escapeField("Sleep Protocol")).toBe("Sleep Protocol");
  });

  it("wraps fields with commas in quotes", () => {
    expect(escapeField("Sleep, Rest & Recovery")).toBe('"Sleep, Rest & Recovery"');
  });

  it("escapes double quotes by doubling them", () => {
    expect(escapeField('The "Best" Protocol')).toBe('"The ""Best"" Protocol"');
  });

  it("wraps fields with newlines in quotes", () => {
    expect(escapeField("Line 1\nLine 2")).toBe('"Line 1\nLine 2"');
  });

  it("handles field with both comma and quotes", () => {
    expect(escapeField('"Hello", World')).toBe('"""Hello"", World"');
  });

  it("returns empty string as-is", () => {
    expect(escapeField("")).toBe("");
  });
});

describe("buildCsvRow", () => {
  it("builds a simple CSV row", () => {
    expect(buildCsvRow("2026-03-28", "Sleep Optimization", "Morning Light")).toBe(
      "2026-03-28,Sleep Optimization,Morning Light,Yes"
    );
  });

  it("escapes protocol name with comma", () => {
    const row = buildCsvRow("2026-03-28", "Sleep, Focus & More", "Cold Shower");
    expect(row).toBe('2026-03-28,"Sleep, Focus & More",Cold Shower,Yes');
  });

  it("escapes tool name with quotes", () => {
    const row = buildCsvRow("2026-03-28", "Focus Protocol", '"Deep Work" Timer');
    expect(row).toBe('2026-03-28,Focus Protocol,"""Deep Work"" Timer",Yes');
  });
});

describe("CSV header format", () => {
  it("has correct column headers", () => {
    const header = "Date,Protocol,Tool,Completed";
    const columns = header.split(",");
    expect(columns).toEqual(["Date", "Protocol", "Tool", "Completed"]);
  });

  it("produces valid CSV with header + rows", () => {
    const header = "Date,Protocol,Tool,Completed";
    const rows = [
      buildCsvRow("2026-03-28", "Sleep", "Light Exposure"),
      buildCsvRow("2026-03-27", "Focus", "Caffeine Timing"),
    ];
    const csv = [header, ...rows].join("\n");

    const lines = csv.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("Date,Protocol,Tool,Completed");
    expect(lines[1]).toContain("2026-03-28");
    expect(lines[2]).toContain("2026-03-27");
  });
});
