/**
 * E2E Tests: Citation Display in Chat
 *
 * Tests that assistant responses include source citations from
 * the RAG pipeline, displayed as a "Sources:" section below the
 * response text.
 */

import { test, expect } from "@playwright/test";
import { signInTestUser } from "./helpers";

test.describe("Citation Display", () => {
  test.beforeEach(async ({ page }) => {
    await signInTestUser(page);
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");
  });

  test("assistant response displays source citations", async ({ page }) => {
    const input = page.getByPlaceholder(/ask about health protocols/i);
    await input.fill("What are the best protocols for improving sleep quality?");

    const sendBtn = page.getByRole("button", { name: /send/i });
    await sendBtn.click();

    // Wait for assistant response to appear
    const messagesArea = page.locator(".max-w-3xl.mx-auto");
    await messagesArea
      .locator('[class*="bg-muted"]')
      .first()
      .waitFor({ timeout: 15000 });

    // Wait for streaming to complete (cursor disappears)
    await expect(page.locator(".animate-pulse")).toHaveCount(0, {
      timeout: 30000,
    });

    // Check for "Sources:" label in the assistant response
    const sourcesLabel = messagesArea.getByText("Sources:");
    await expect(sourcesLabel).toBeVisible({ timeout: 5000 });

    // Verify at least one source title is rendered below the label
    const sourcesContainer = sourcesLabel.locator("..");
    const sourceItems = sourcesContainer.locator("p.text-xs");
    // First p is "Sources:" label, remaining are source titles
    const count = await sourceItems.count();
    expect(count).toBeGreaterThanOrEqual(2); // label + at least 1 source
  });

  test("citation section has correct structure", async ({ page }) => {
    const input = page.getByPlaceholder(/ask about health protocols/i);
    await input.fill("Tell me about cold exposure benefits");

    const sendBtn = page.getByRole("button", { name: /send/i });
    await sendBtn.click();

    // Wait for streaming to complete
    const messagesArea = page.locator(".max-w-3xl.mx-auto");
    await messagesArea
      .locator('[class*="bg-muted"]')
      .first()
      .waitFor({ timeout: 15000 });

    await expect(page.locator(".animate-pulse")).toHaveCount(0, {
      timeout: 30000,
    });

    // The citation container has a top border separator
    const citationContainer = messagesArea.locator(
      '[class*="border-t"][class*="border-border"]'
    );

    // If sources were returned by RAG, verify the structure
    const hasCitations = (await citationContainer.count()) > 0;
    if (hasCitations) {
      await expect(citationContainer.first()).toBeVisible();
      // Should contain the "Sources:" text
      await expect(
        citationContainer.first().getByText("Sources:")
      ).toBeVisible();
    }
  });

  test("user messages do not show citations", async ({ page }) => {
    const input = page.getByPlaceholder(/ask about health protocols/i);
    await input.fill("How do I improve focus?");

    const sendBtn = page.getByRole("button", { name: /send/i });
    await sendBtn.click();

    // User message bubble (primary color)
    const userBubble = page
      .locator('[class*="bg-primary"]')
      .filter({ hasText: "How do I improve focus?" });
    await expect(userBubble).toBeVisible();

    // User bubble should NOT contain "Sources:"
    await expect(userBubble.getByText("Sources:")).toHaveCount(0);
  });
});
