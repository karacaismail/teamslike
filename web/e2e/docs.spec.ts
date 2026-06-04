import { test, expect } from "@playwright/test";

// Faz 9 / cluster B E2E: canvas → board (move card) → workflow run → clips.
test("docs: canvas → board → workflow run", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("link", { name: "Docs & Projects" }).click();
  await expect(page).toHaveURL(/docs/);
  await expect(page.getByText("Q3 Launch Plan").first()).toBeVisible();

  // Board tab → a card is visible.
  await page.getByRole("tab", { name: "Board" }).click();
  await expect(page.getByText("Pricing page")).toBeVisible();

  // Workflows tab → run a workflow, see the run log.
  await page.getByRole("tab", { name: "Workflows" }).click();
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByText("Run log")).toBeVisible();
});
