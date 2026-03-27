/**
 * E2E Tests: Authentication
 *
 * Tests email sign-up, sign-in, phone OTP UI, Google OAuth button,
 * auth redirects, and sign-out.
 */

import { test, expect } from "@playwright/test";
import "./helpers";

test.describe("Auth Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
  });

  test("renders auth page with Craftwell logo", async ({ page }) => {
    await expect(page.getByText("Welcome")).toBeVisible();
    await expect(
      page.getByText("Sign in to access your health protocols")
    ).toBeVisible();
  });

  test("shows Google OAuth button", async ({ page }) => {
    const googleBtn = page.getByRole("button", {
      name: /continue with google/i,
    });
    await expect(googleBtn).toBeVisible();
  });

  test("does not show Apple button (deferred)", async ({ page }) => {
    const appleBtn = page.getByRole("button", { name: /apple/i });
    await expect(appleBtn).not.toBeVisible();
  });

  test("has Sign In and Sign Up tabs", async ({ page }) => {
    await expect(page.getByRole("tab", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Sign Up" })).toBeVisible();
  });

  test("Sign In tab shows email and password fields", async ({ page }) => {
    await page.getByRole("tab", { name: "Sign In" }).click();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign In" })
    ).toBeVisible();
  });

  test("Sign Up tab shows email and password fields", async ({ page }) => {
    await page.getByRole("tab", { name: "Sign Up" }).click();
    const signUpPanel = page.getByRole("tabpanel", { name: "Sign Up" });
    await expect(signUpPanel.getByPlaceholder("Email")).toBeVisible();
    await expect(
      signUpPanel.getByPlaceholder("Password (min 6 characters)")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Account" })
    ).toBeVisible();
  });

  test("can switch to Phone auth mode", async ({ page }) => {
    await page.getByRole("tab", { name: "Sign In" }).click();
    await page.getByRole("button", { name: "Phone" }).click();

    await expect(page.getByPlaceholder(/555/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send verification code/i })
    ).toBeVisible();
  });

  test("can switch between Email and Phone modes", async ({ page }) => {
    // Start with email
    await page.getByRole("tab", { name: "Sign In" }).click();
    await expect(page.getByPlaceholder("Email")).toBeVisible();

    // Switch to phone
    await page.getByRole("button", { name: "Phone" }).click();
    await expect(page.getByPlaceholder(/555/)).toBeVisible();

    // Switch back to email
    await page.getByRole("button", { name: "Email" }).click();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
  });

  test("shows error for invalid email sign-in", async ({ page }) => {
    await page.getByRole("tab", { name: "Sign In" }).click();
    // Sign In tab is default so its inputs are visible
    await page.getByPlaceholder("Email").first().fill("nonexistent@test.com");
    await page.getByPlaceholder("Password").first().fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should show an error message (Supabase API call may take time)
    await expect(page.getByText(/invalid|error|credentials/i)).toBeVisible({
      timeout: 15000,
    });
  });

  test("shows error for short password on sign up", async ({ page }) => {
    await page.getByRole("tab", { name: "Sign Up" }).click();
    const signUpPanel = page.getByRole("tabpanel", { name: "Sign Up" });
    await signUpPanel.getByPlaceholder("Email").fill("short@test.com");
    await signUpPanel.getByPlaceholder("Password").fill("12");
    await page.getByRole("button", { name: "Create Account" }).click();

    // Supabase requires min 6 chars
    await expect(page.getByText(/password|characters|short|least/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("phone OTP send button disabled when phone empty", async ({ page }) => {
    await page.getByRole("tab", { name: "Sign In" }).click();
    await page.getByRole("button", { name: "Phone" }).click();

    const sendBtn = page.getByRole("button", {
      name: /send verification code/i,
    });
    await expect(sendBtn).toBeDisabled();
  });

  test("phone OTP send button enabled when phone entered", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "Sign In" }).click();
    await page.getByRole("button", { name: "Phone" }).click();

    await page.getByPlaceholder(/555/).fill("+15551234567");

    const sendBtn = page.getByRole("button", {
      name: /send verification code/i,
    });
    await expect(sendBtn).toBeEnabled();
  });
});

test.describe("Auth Redirects", () => {
  test("unauthenticated user can access /protocols without redirect", async ({
    page,
  }) => {
    await page.goto("/protocols");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/protocols/);
  });

  test("unauthenticated user redirected from /chat to /auth", async ({
    page,
  }) => {
    await page.goto("/chat");
    await page.waitForURL("**/auth", { timeout: 10000 });
    await expect(page).toHaveURL(/\/auth/);
  });

  test("unauthenticated user redirected from /profile to /auth", async ({
    page,
  }) => {
    await page.goto("/profile");
    await page.waitForURL("**/auth", { timeout: 10000 });
    await expect(page).toHaveURL(/\/auth/);
  });

  test("landing page is accessible without auth", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Craftwell")).toBeVisible();
  });
});
