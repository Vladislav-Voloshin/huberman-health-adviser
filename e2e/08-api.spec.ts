/**
 * E2E Tests: API Routes
 *
 * Tests API endpoints for proper auth, response format, and error handling.
 * Unauthenticated API requests should return 401 JSON (not redirect).
 */

import { test, expect } from "@playwright/test";

test.describe("API: Chat Endpoint", () => {
  test("POST /api/chat without auth returns 401", async ({ request }) => {
    const res = await request.post("/api/chat", {
      headers: { "Content-Type": "application/json" },
      data: { message: "test" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});

test.describe("API: User Protocols Endpoint", () => {
  test("GET /api/protocols/user without auth returns 401", async ({
    request,
  }) => {
    const res = await request.get("/api/protocols/user");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/protocols/user without auth returns 401", async ({
    request,
  }) => {
    const res = await request.post("/api/protocols/user", {
      headers: { "Content-Type": "application/json" },
      data: { protocol_id: "test", action: "activate" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});

test.describe("API: Ingest Endpoint", () => {
  test("POST /api/ingest without admin key returns 401", async ({
    request,
  }) => {
    const res = await request.post("/api/ingest", {
      headers: { "Content-Type": "application/json" },
      data: { step: "extract-protocols" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/ingest with correct admin key and unknown step returns 400", async ({
    request,
  }) => {
    const res = await request.post("/api/ingest", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer huberman-admin-2026-secret",
      },
      data: { step: "nonexistent-step" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Unknown step");
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
