/**
 * Tests for the favorites API route validation schema.
 */
import { z } from "zod";

const toggleSchema = z.object({
  protocol_id: z.string().uuid(),
});

describe("favorites toggleSchema validation", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid UUID protocol_id", () => {
    const result = toggleSchema.safeParse({ protocol_id: validUUID });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID string", () => {
    const result = toggleSchema.safeParse({ protocol_id: "abc123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = toggleSchema.safeParse({ protocol_id: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing protocol_id", () => {
    const result = toggleSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects numeric protocol_id", () => {
    const result = toggleSchema.safeParse({ protocol_id: 12345 });
    expect(result.success).toBe(false);
  });

  it("strips extra fields", () => {
    const result = toggleSchema.safeParse({
      protocol_id: validUUID,
      extra_field: "should be ignored",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ protocol_id: validUUID });
    }
  });
});
