/**
 * E2E Tests: Protocol Search (Sprint 3)
 *
 * Tests the search input on the protocol listing page —
 * filtering by title/description/tags, clearing, and combining with category filter.
 */

import { test, expect } from "@playwright/test";
import { signInTestUser } from "./helpers";

test.describe("Protocol Search", () => {
  test.beforeEach(async ({ page }) => {
    await signInTestUser(page);
    await page.goto("/protocols");
    await page.waitForLoadState("domcontentloaded");
  });

  test("shows search input on protocols page", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search protocols...");
    await expect(searchInput).toBeVisible();
  });

  test("search filters protocols by title", async ({ page }) => {
    const allCards = await page.locator("a[href^='/protocols/']").count();
    expect(allCards).toBeGreaterThan(0);

    const searchInput = page.getByPlaceholder("Search protocols...");
    await searchInput.fill("sleep");
    // Wait for debounce to filter results
    await page.waitForFunction(
      () => document.querySelectorAll("a[href^='/protocols/']").length > 0
    );

    const filteredCards = await page.locator("a[href^='/protocols/']").count();
    expect(filteredCards).toBeGreaterThan(0);
    expect(filteredCards).toBeLessThanOrEqual(allCards);
  });

  test("search with no results shows empty state", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search protocols...");
    await searchInput.fill("xyznonexistent12345");
    // Wait for debounce to filter — expect zero results
    await page.waitForFunction(
      () => document.querySelectorAll("a[href^='/protocols/']").length === 0
    );

    const cards = await page.locator("a[href^='/protocols/']").count();
    expect(cards).toBe(0);
  });

  test("clearing search restores all protocols", async ({ page }) => {
    const allCards = await page.locator("a[href^='/protocols/']").count();

    const searchInput = page.getByPlaceholder("Search protocols...");
    await searchInput.fill("sleep");
    // Wait for debounce to filter results
    await page.waitForFunction(
      () => document.querySelectorAll("a[href^='/protocols/']").length > 0
    );

    // Clear the search
    await searchInput.fill("");
    // Wait for all protocols to be restored
    await page.waitForFunction(
      (expected) => document.querySelectorAll("a[href^='/protocols/']").length === expected,
      allCards
    );

    const restoredCards = await page.locator("a[href^='/protocols/']").count();
    expect(restoredCards).toBe(allCards);
  });

  test("search combined with category filter works", async ({ page }) => {
    // Click a category filter first
    const sleepButton = page.getByRole("button", { name: /sleep/i });
    if (await sleepButton.isVisible()) {
      await sleepButton.click();
      // Wait for category filter to apply
      await page.waitForFunction(
        () => document.querySelectorAll("a[href^='/protocols/']").length > 0
      );

      const categoryCards = await page.locator("a[href^='/protocols/']").count();

      // Now also search
      const searchInput = page.getByPlaceholder("Search protocols...");
      await searchInput.fill("morning");
      // Wait for debounce to apply combined filter
      await page.waitForFunction(
        (max) => document.querySelectorAll("a[href^='/protocols/']").length <= max,
        categoryCards
      );

      const combinedCards = await page.locator("a[href^='/protocols/']").count();
      expect(combinedCards).toBeLessThanOrEqual(categoryCards);
    }
  });
});
