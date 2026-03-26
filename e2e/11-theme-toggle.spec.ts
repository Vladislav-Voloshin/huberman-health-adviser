/**
 * E2E Tests: Theme Toggle (Sprint 3)
 *
 * Tests dark/light mode switching via the theme toggle button in the header.
 */

import { test, expect } from "@playwright/test";
import { signInTestUser } from "./helpers";

test.describe("Theme Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await signInTestUser(page);
    await page.goto("/protocols");
    await page.waitForLoadState("networkidle");
  });

  test("theme toggle button is visible in header", async ({ page }) => {
    const toggleBtn = page.getByRole("button", { name: /toggle theme/i });
    await expect(toggleBtn).toBeVisible();
  });

  test("clicking theme toggle changes the theme class on html", async ({
    page,
  }) => {
    const html = page.locator("html");
    const initialClass = await html.getAttribute("class");
    const wasDark = initialClass?.includes("dark");

    const toggleBtn = page.getByRole("button", { name: /toggle theme/i });
    await toggleBtn.click();
    await page.waitForTimeout(500);

    const newClass = await html.getAttribute("class");
    const isDark = newClass?.includes("dark");

    // Theme should have toggled
    expect(isDark).not.toBe(wasDark);
  });

  test("toggling theme twice returns to original theme", async ({ page }) => {
    const html = page.locator("html");
    const initialClass = await html.getAttribute("class");

    const toggleBtn = page.getByRole("button", { name: /toggle theme/i });
    await toggleBtn.click();
    await page.waitForTimeout(300);
    await toggleBtn.click();
    await page.waitForTimeout(300);

    const finalClass = await html.getAttribute("class");
    expect(finalClass?.includes("dark")).toBe(initialClass?.includes("dark"));
  });
});
