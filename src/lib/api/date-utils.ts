/**
 * Date utilities for API routes — timezone-aware local date and date arithmetic.
 */

/** Get today's date string (YYYY-MM-DD) adjusted by a timezone offset in minutes. */
export function getLocalDate(offsetMinutes: number = 0): string {
  const now = new Date();
  const local = new Date(now.getTime() - offsetMinutes * 60000);
  return local.toISOString().split("T")[0];
}

/** Compute the number of days between two YYYY-MM-DD strings using UTC to avoid DST issues. */
export function daysBetween(a: string, b: string): number {
  const msA = Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10));
  const msB = Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10));
  return Math.round((msA - msB) / 86400000);
}
