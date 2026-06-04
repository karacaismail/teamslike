import { test, expect } from "@playwright/test";

// Faz 8 plan E2E: open conversation → AI suggest → insert → resolve.
test("support: inbox → conversation → AI suggestion → resolve", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("link", { name: "Support Inbox" }).click();
  await expect(page).toHaveURL(/support/);
  await expect(page.getByText("Website chat")).toBeVisible();

  // Open the first conversation.
  await page.getByText("Jordan Blake").first().click();

  // Ask the AI for a draft reply, then insert it (human-approved).
  await page.getByRole("button", { name: "Suggest a reply (AI)" }).click();
  await expect(page.getByText("AI suggested reply")).toBeVisible();
  await page.getByRole("button", { name: "Insert draft" }).click();

  // Resolve via the status select.
  await page.getByLabel("Status").selectOption("resolved");
});
