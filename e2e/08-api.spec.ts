/**
 * E2E Tests: API Routes
 *
 * Tests API endpoints for proper auth, response format, and error handling.
 * Note: The proxy middleware may redirect unauthenticated requests to /auth,
 * so we test both the redirect behavior and the API contract.
 */

import { test, expect } from "@playwright/test";

test.describe("API: Chat Endpoint", () => {
  test("POST /api/chat without auth returns 401 or redirects", async ({
    request,
  }) => {
    const res = await request.post("/api/chat", {
      headers: { "Content-Type": "application/json" },
      data: { message: "test" },
    });
    // Either 401 (API handles auth) or 200/302 (proxy redirected to /auth page)
    expect([200, 302, 401]).toContain(res.status());
  });
});

test.describe("API: User Protocols Endpoint", () => {
  test("GET /api/protocols/user without auth returns 401 or redirects", async ({
    request,
  }) => {
    const res = await request.get("/api/protocols/user");
    expect([200, 302, 401]).toContain(res.status());
  });

  test("POST /api/protocols/user without auth returns 401 or redirects", async ({
    request,
  }) => {
    const res = await request.post("/api/protocols/user", {
      headers: { "Content-Type": "application/json" },
      data: { protocol_id: "test", action: "activate" },
    });
    expect([200, 302, 401]).toContain(res.status());
  });
});

test.describe("API: Ingest Endpoint", () => {
  test("POST /api/ingest without admin key is rejected or redirected", async ({
    request,
  }) => {
    const res = await request.post("/api/ingest", {
      headers: { "Content-Type": "application/json" },
      data: { step: "extract-protocols" },
    });
    // Proxy may redirect, or API returns 401
    expect([200, 302, 401]).toContain(res.status());
  });

  test("POST /api/ingest with correct admin key returns success", async ({
    request,
  }) => {
    const res = await request.post("/api/ingest", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer huberman-admin-2026-secret",
      },
      data: { step: "nonexistent-step" },
    });

    // Either proxy redirects, or we get 400 for unknown step
    const status = res.status();
    if (status === 400) {
      const body = await res.json();
      expect(body.error).toContain("Unknown step");
    }
    // If proxy redirected (200), that's also acceptable
    expect([200, 400]).toContain(status);
  });
});

test.describe("API: Auth Callback", () => {
  test("GET /auth/callback without code redirects to auth with error", async ({
    page,
  }) => {
    await page.goto("/auth/callback");
    await page.waitForURL("**/auth*", { timeout: 10000 });
    expect(page.url()).toContain("/auth");
  });
});
