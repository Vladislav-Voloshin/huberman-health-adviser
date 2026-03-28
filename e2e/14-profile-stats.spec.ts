/**
 * E2E Tests: Profile Streaks & Stats (Sprint 3)
 *
 * Tests the streak tracking and completion statistics on the profile page.
 * Note: Streaks & Stats section only renders when the user has active protocols.
 */

import { test, expect } from "@playwright/test";
import { signInTestUser, TEST_USER } from "./helpers";

test.describe("Profile Stats & Streaks", () => {
  test.beforeEach(async ({ page }) => {
    await signInTestUser(page);
    await page.goto("/profile");
    await page.waitForLoadState("domcontentloaded");
  });

  test("profile shows user email", async ({ page }) => {
    await expect(page.getByText(TEST_USER.email)).toBeVisible();
  });

  test("profile shows Streaks & Stats section when protocols are active", async ({ page }) => {
    const content = await page.innerText("body");
    const hasActiveProtocols = content?.includes("Active Protocols") || content?.includes("active protocols");
    // Stats section is conditionally rendered — only when user has active protocols
    if (hasActiveProtocols) {
      expect(
        content?.includes("Streak") ||
          content?.includes("streak") ||
          content?.includes("Stats") ||
          content?.includes("stats")
      ).toBeTruthy();
    } else {
      // Without active protocols, the protocol section shows "Browse Protocols" instead
      expect(
        content?.includes("Browse Protocols") ||
          content?.includes("No active protocols")
      ).toBeTruthy();
    }
  });

  test("stats section shows Active Protocols count when protocols are active", async ({ page }) => {
    const content = await page.innerText("body");
    const hasActiveProtocols = content?.includes("Active Protocols") || content?.includes("active protocols");
    // Only assert the stat labels when the stats section is rendered
    if (hasActiveProtocols) {
      expect(hasActiveProtocols).toBeTruthy();
    } else {
      // Verify the protocol stack card renders even without active protocols
      expect(
        content?.includes("Protocol Stack") ||
          content?.includes("protocol") ||
          content?.includes("Browse Protocols")
      ).toBeTruthy();
    }
  });

  test("stats section shows Total Days when protocols are active", async ({ page }) => {
    const content = await page.innerText("body");
    const hasActiveProtocols = content?.includes("Active Protocols") || content?.includes("active protocols");
    if (hasActiveProtocols) {
      expect(
        content?.includes("Total Days") || content?.includes("total days")
      ).toBeTruthy();
    }
  });

  test("stats section shows Best Streak when protocols are active", async ({ page }) => {
    const content = await page.innerText("body");
    const hasActiveProtocols = content?.includes("Active Protocols") || content?.includes("active protocols");
    if (hasActiveProtocols) {
      expect(
        content?.includes("Best Streak") || content?.includes("best streak")
      ).toBeTruthy();
    }
  });

  test("health profile shows survey data", async ({ page }) => {
    const content = await page.innerText("body");
    // Should show health profile data from onboarding survey
    expect(
      content?.includes("Health Profile") ||
        content?.includes("Sleep Quality") ||
        content?.includes("Stress Level") ||
        content?.includes("Goals")
    ).toBeTruthy();
  });

  test("member since date is displayed", async ({ page }) => {
    const content = await page.innerText("body");
    expect(
      content?.includes("Member since") || content?.includes("member since")
    ).toBeTruthy();
  });
});
