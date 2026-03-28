/**
 * Shared Zod schemas for API route validation.
 */
import { z } from "zod";

export const completionSchema = z.object({
  protocol_id: z.string().uuid(),
  tool_id: z.string().uuid(),
  tz_offset: z.number().int().min(-720).max(720).optional(),
});

export const favoriteToggleSchema = z.object({
  protocol_id: z.string().uuid(),
});
