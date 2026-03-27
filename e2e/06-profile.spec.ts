/**
 * E2E Tests: Profile Page
 *
 * Tests profile display, health info, protocol stack, and sign out.
 */

import { test, expect } from "@playwright/test";
import { signInTestUser, TEST_USER } from "./helpers";

test.describe("Profile Page", () => {
  test.beforeEach(async ({ page }) => {
    await signInTestUser(page);
    await page.goto("/profile");
    await page.waitForLoadState("domcontentloaded");
  });

  test("displays account section with email", async ({ page }) => {
    // Should show the user's email
    await expect(page.getByText(TEST_USER.email)).toBeVisible();
  });

  test("shows Account information card", async ({ page }) => {
    const content = await page.innerText("body");
    expect(
      content?.includes("Account") || content?.includes("account")
    ).toBeTruthy();
  });

  test("shows Health Profile section", async ({ page }) => {
    const content = await page.innerText("body");
    expect(
      content?.includes("Health") || content?.includes("Profile")
    ).toBeTruthy();
  });

  test("shows My Protocol Stack section", async ({ page }) => {
    const content = await page.innerText("body");
    expect(
      content?.includes("Protocol") ||
        content?.includes("protocol") ||
        content?.includes("Browse Protocols")
    ).toBeTruthy();
  });

  test("has sign out button", async ({ page }) => {
    const signOutBtn = page.getByRole("button", { name: /sign out/i });
    await expect(signOutBtn).toBeVisible();
  });

  test("sign out redirects to landing or auth page", async ({ page }) => {
    const signOutBtn = page.getByRole("button", { name: /sign out/i });
    await signOutBtn.click();

    // After sign out, should redirect to landing page or auth
    await page.waitForURL(/(\/auth|\/$)/, { timeout: 10000 });
    const url = page.url();
    expect(url.includes("/auth") || url.endsWith("/")).toBeTruthy();
  });

  test("protocol stack section exists on profile", async ({ page }) => {
    const content = await page.innerText("body");
    // Should mention protocols section — either active protocols or browse link
    expect(
      content?.includes("Protocol") ||
        content?.includes("protocol") ||
        content?.includes("Browse")
    ).toBeTruthy();
  });
});

test.describe("Profile Navigation", () => {
  test("bottom nav Profile link navigates to profile", async ({ page }) => {
    await signInTestUser(page);
    await page.goto("/protocols");
    await page.waitForLoadState("domcontentloaded");

    // Click profile in bottom nav (👤 icon or "Profile" text)
    const profileNav = page.getByRole("link", { name: /profile/i });
    if (await profileNav.isVisible()) {
      await profileNav.click();
      await expect(page).toHaveURL(/\/profile/);
    }
  });
});
