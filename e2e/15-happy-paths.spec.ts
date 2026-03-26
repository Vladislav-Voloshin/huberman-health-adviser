/**
 * E2E Tests: P0 Happy Path Flows
 *
 * End-to-end flows covering the critical user journeys:
 * 1. Landing → Auth → Protocols (returning user)
 * 2. Protocol browse → Detail → Add to stack
 * 3. Protocol detail → Ask AI (chat)
 * 4. Full navigation cycle: Protocols → Chat → Profile → Protocols
 * 5. Sign out and re-sign in
 */

import { test, expect } from "@playwright/test";
import { signInTestUser, TEST_USER } from "./helpers";

test.describe("P0 Happy Path: Returning User Login → Protocols", () => {
  test("user can sign in and land on protocols page", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("tab", { name: "Sign In" }).click();
    await page.getByPlaceholder("Email").fill(TEST_USER.email);
    await page.getByPlaceholder("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    await page.waitForURL("**/protocols", { timeout: 15000 });
    await expect(page).toHaveURL(/\/protocols/);

    // Should see protocol cards
    const cards = page.locator("a[href^='/protocols/']");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("P0 Happy Path: Browse → Detail → Add to Stack", () => {
  test("user can browse protocols, open detail, and add to stack", async ({
    page,
  }) => {
    await signInTestUser(page);
    await page.goto("/protocols");
    await page.waitForLoadState("networkidle");

    // Browse: see protocol cards
    const cards = page.locator("a[href^='/protocols/']");
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Open first protocol detail
    const firstCard = cards.first();
    const protocolTitle = await firstCard.textContent();
    await firstCard.click();
    await page.waitForURL(/\/protocols\/.+/);

    // Should see protocol content
    await expect(page.locator("body")).toContainText(/tools completed|Instructions/i);

    // Add to stack (or verify already added)
    const addBtn = page.getByRole("button", { name: /add to my protocols/i });
    const removeBtn = page.getByRole("button", {
      name: /remove from my protocols/i,
    });

    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(removeBtn).toBeVisible({ timeout: 5000 });
    } else {
      // Already in stack
      await expect(removeBtn).toBeVisible();
    }
  });
});

test.describe("P0 Happy Path: Protocol → Chat about it", () => {
  test("user can navigate from protocol detail to chat", async ({ page }) => {
    await signInTestUser(page);
    await page.goto("/protocols");
    await page.waitForLoadState("networkidle");

    // Open a protocol
    await page.locator("a[href^='/protocols/']").first().click();
    await page.waitForURL(/\/protocols\/.+/);

    // Navigate to chat via bottom nav
    const chatLink = page.getByRole("link", { name: /chat/i });
    if (await chatLink.isVisible()) {
      await chatLink.click();
      await expect(page).toHaveURL(/\/chat/);

      // Chat page should load with input
      await expect(
        page.getByPlaceholder(/ask about health protocols/i)
      ).toBeVisible();
    }
  });
});

test.describe("P0 Happy Path: Full Navigation Cycle", () => {
  test("user can navigate Protocols → Chat → Profile → Protocols", async ({
    page,
  }) => {
    await signInTestUser(page);

    // Start on protocols
    await page.goto("/protocols");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/protocols/);

    // Go to chat
    const chatLink = page.getByRole("link", { name: /chat/i });
    if (await chatLink.isVisible()) {
      await chatLink.click();
      await expect(page).toHaveURL(/\/chat/);
    }

    // Go to profile
    const profileLink = page.getByRole("link", { name: /profile/i });
    if (await profileLink.isVisible()) {
      await profileLink.click();
      await expect(page).toHaveURL(/\/profile/);

      // Verify profile loaded
      await expect(page.getByText(TEST_USER.email)).toBeVisible();
    }

    // Back to protocols
    const protocolsLink = page.getByRole("link", { name: /protocols/i });
    if (await protocolsLink.isVisible()) {
      await protocolsLink.click();
      await expect(page).toHaveURL(/\/protocols/);
    }
  });
});

test.describe("P0 Happy Path: Sign Out & Re-Sign In", () => {
  test("user can sign out and sign back in", async ({ page }) => {
    await signInTestUser(page);

    // Go to profile and sign out
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    const signOutBtn = page.getByRole("button", { name: /sign out/i });
    await signOutBtn.click();

    // Should redirect to auth or landing
    await page.waitForURL(/(\/auth|\/$)/, { timeout: 10000 });

    // Sign back in
    if (!page.url().includes("/auth")) {
      await page.goto("/auth");
    }
    await page.getByRole("tab", { name: "Sign In" }).click();
    await page.getByPlaceholder("Email").fill(TEST_USER.email);
    await page.getByPlaceholder("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    await page.waitForURL("**/protocols", { timeout: 15000 });
    await expect(page).toHaveURL(/\/protocols/);
  });
});

test.describe("P0 Happy Path: Landing Page → Auth Flow", () => {
  test("new visitor can navigate from landing to auth", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Craftwell")).toBeVisible();

    // Click Get Started
    const cta = page.getByRole("link", { name: /get started/i });
    await cta.click();
    await expect(page).toHaveURL(/\/auth/);

    // Auth page loads with sign in/up tabs
    await expect(page.getByRole("tab", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Sign Up" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue with google/i })
    ).toBeVisible();
  });
});

test.describe("P0 Happy Path: Search and Filter Protocols", () => {
  test("user can search and filter to find a protocol", async ({ page }) => {
    await signInTestUser(page);
    await page.goto("/protocols");
    await page.waitForLoadState("networkidle");

    // Use search
    const searchInput = page.getByPlaceholder("Search protocols...");
    await searchInput.fill("sleep");
    await page.waitForTimeout(500);

    // Should show filtered results
    const cards = page.locator("a[href^='/protocols/']");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Click into one of the results
    await cards.first().click();
    await page.waitForURL(/\/protocols\/.+/);

    // Protocol detail should load
    const content = await page.textContent("body");
    expect(content?.length).toBeGreaterThan(100);
  });
});
