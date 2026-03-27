import { NextRequest } from "next/server";
import crypto from "crypto";

/**
 * Extract or generate a request ID.
 * Checks x-request-id header first (from upstream proxy/CDN),
 * falls back to a generated UUID.
 */
export function getRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id") || crypto.randomUUID();
}
