/** Public routes that don't require authentication. */
const PUBLIC_ROUTES = ["/", "/auth", "/protocols", "/privacy", "/terms"];

/** Check whether a pathname is publicly accessible (no auth required). */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/protocols") ||
      pathname.startsWith("/privacy") ||
      pathname.startsWith("/terms")
  );
}
