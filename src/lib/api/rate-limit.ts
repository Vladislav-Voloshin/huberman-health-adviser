const windowMs = 60_000; // 1 minute
const maxRequests = 20;

const requests = new Map<string, number[]>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of requests) {
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length === 0) {
      requests.delete(key);
    } else {
      requests.set(key, valid);
    }
  }
}, 5 * 60_000);

/**
 * Check if a user has exceeded the rate limit.
 * Returns null if allowed, or a Response with 429 if rate-limited.
 */
export function checkRateLimit(userId: string): Response | null {
  const now = Date.now();
  const timestamps = requests.get(userId) ?? [];
  const valid = timestamps.filter((t) => now - t < windowMs);

  if (valid.length >= maxRequests) {
    const oldestValid = valid[0];
    const retryAfter = Math.ceil((oldestValid + windowMs - now) / 1000);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  valid.push(now);
  requests.set(userId, valid);
  return null;
}
