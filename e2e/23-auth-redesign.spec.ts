/**
 * E2E Tests: Auth Page Redesign (Sprint 14)
 *
 * Tests the polished auth page with unified toggles, branding, and legal links.
 */

import { test, expect } from "@playwright/test";

test.describe("Auth Page Redesign", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("domcontentloaded");
  });

  test("displays Craftwell branding and tagline", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /welcome to craftwell/i })
    ).toBeVisible();

    await expect(
      page.getByText(/science-based health protocols/i)
    ).toBeVisible();
  });

  test("has Google sign-in button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /continue with google/i })
    ).toBeVisible();
  });

  test("has unified Sign In / Sign Up toggle", async ({ page }) => {
    const signInBtn = page.getByRole("button", { name: "Sign In" });
    const signUpBtn = page.getByRole("button", { name: "Sign Up" });

    await expect(signInBtn).toBeVisible();
    await expect(signUpBtn).toBeVisible();

    // Click Sign Up
    await signUpBtn.click();

    // Email form should still be visible
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  });

  test("has unified Email / Phone toggle", async ({ page }) => {
    const emailBtn = page.getByRole("button", { name: "Email" });
    const phoneBtn = page.getByRole("button", { name: "Phone" });

    await expect(emailBtn).toBeVisible();
    await expect(phoneBtn).toBeVisible();

    // Switch to phone
    await phoneBtn.click();
    await expect(page.getByPlaceholder(/phone/i)).toBeVisible();
  });

  test("has Terms and Privacy links at bottom", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /terms of service/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /privacy policy/i })
    ).toBeVisible();
  });

  test("has Forgot password link on sign in", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /forgot password/i })
    ).toBeVisible();
  });
});
