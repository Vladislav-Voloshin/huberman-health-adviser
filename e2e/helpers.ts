/**
 * E2E Test Helpers
 *
 * Shared utilities for authentication, test data, and common actions.
 */

import { Page, expect } from "@playwright/test";

// Test user credentials — uses a dedicated test account
export const TEST_USER = {
  email: "e2e-test@craftwell.app",
  password: "TestPass123!",
};

/**
 * Sign up a new test user via the auth page
 */
export async function signUpTestUser(page: Page) {
  await page.goto("/auth");
  await page.getByRole("tab", { name: "Sign Up" }).click();
  await page.getByPlaceholder("Email").fill(TEST_USER.email);
  await page.getByPlaceholder("Password").fill(TEST_USER.password);
  await page.getByRole("button", { name: "Create Account" }).click();
}

/**
 * Sign in with email/password via the auth page
 */
export async function signInTestUser(page: Page) {
  await page.goto("/auth");
  await page.getByRole("tab", { name: "Sign In" }).click();
  await page.getByPlaceholder("Email").fill(TEST_USER.email);
  await page.getByPlaceholder("Password").fill(TEST_USER.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  // Wait for redirect away from /auth
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), {
    timeout: 10000,
  });
}

/**
 * Sign in and complete onboarding if needed
 */
export async function signInAndOnboard(page: Page) {
  await signInTestUser(page);

  // If redirected to onboarding, complete it
  if (page.url().includes("/onboarding")) {
    await completeOnboarding(page);
  }
}

/**
 * Complete the 4-step onboarding wizard
 */
export async function completeOnboarding(page: Page) {
  // Step 0: Health goals — click at least one
  await page.waitForSelector("text=What are your health goals");
  await page.getByText("Better Sleep").click();
  await page.getByText("More Energy").click();
  await page.getByRole("button", { name: "Next" }).click();

  // Step 1: Sleep quality + Stress level (sliders default to middle, just advance)
  await page.waitForSelector("text=sleep");
  await page.getByRole("button", { name: "Next" }).click();

  // Step 2: Exercise frequency + Supplement experience
  await page.waitForSelector("text=exercise");
  await page.getByRole("button", { name: "Next" }).click();

  // Step 3: Focus areas
  await page.waitForSelector("text=focus");
  await page.getByText("Sleep").click();
  await page.getByText("Nutrition").click();
  await page.getByRole("button", { name: /start exploring|finish/i }).click();

  // Wait for redirect to /protocols
  await page.waitForURL("**/protocols", { timeout: 10000 });
}

/**
 * Ensure user is authenticated and on the app (past onboarding)
 */
export async function ensureAuthenticated(page: Page) {
  await signInAndOnboard(page);
  // Should be on /protocols or somewhere in the app
  await expect(page).not.toHaveURL(/\/auth/);
}

/**
 * Sign out the current user
 */
export async function signOut(page: Page) {
  await page.goto("/profile");
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.waitForURL("**/auth", { timeout: 10000 });
}

/**
 * Wait for page to be fully loaded (no network activity)
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle");
}
