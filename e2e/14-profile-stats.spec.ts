/**
 * E2E Tests: Profile Streaks & Stats (Sprint 3)
 *
 * Tests the streak tracking and completion statistics on the profile page.
 */

import { test, expect } from "@playwright/test";
import { signInTestUser, TEST_USER } from "./helpers";

test.describe("Profile Stats & Streaks", () => {
  test.beforeEach(async ({ page }) => {
    await signInTestUser(page);
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
  });

  test("profile shows user email", async ({ page }) => {
    await expect(page.getByText(TEST_USER.email)).toBeVisible();
  });

  test("profile shows Streaks & Stats section", async ({ page }) => {
    const content = await page.textContent("body");
    expect(
      content?.includes("Streak") ||
        content?.includes("streak") ||
        content?.includes("Stats") ||
        content?.includes("stats")
    ).toBeTruthy();
  });

  test("stats section shows Active Protocols count", async ({ page }) => {
    const content = await page.textContent("body");
    expect(
      content?.includes("Active Protocols") ||
        content?.includes("active protocols")
    ).toBeTruthy();
  });

  test("stats section shows Total Days", async ({ page }) => {
    const content = await page.textContent("body");
    expect(
      content?.includes("Total Days") || content?.includes("total days")
    ).toBeTruthy();
  });

  test("stats section shows Best Streak", async ({ page }) => {
    const content = await page.textContent("body");
    expect(
      content?.includes("Best Streak") || content?.includes("best streak")
    ).toBeTruthy();
  });

  test("health profile shows survey data", async ({ page }) => {
    const content = await page.textContent("body");
    // Should show health profile data from onboarding survey
    expect(
      content?.includes("Health Profile") ||
        content?.includes("Sleep Quality") ||
        content?.includes("Stress Level") ||
        content?.includes("Goals")
    ).toBeTruthy();
  });

  test("member since date is displayed", async ({ page }) => {
    const content = await page.textContent("body");
    expect(
      content?.includes("Member since") || content?.includes("member since")
    ).toBeTruthy();
  });
});
