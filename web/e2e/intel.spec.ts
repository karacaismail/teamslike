import { test, expect } from "@playwright/test";

// Faz 4 plan E2E: caption/transcript → language switch → analysis report.
test("intelligence: transcript → language switch → report", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();

  // Open the Translation & Intelligence surface.
  await page.getByRole("link", { name: "Translation & Intelligence" }).click();
  await expect(page).toHaveURL(/intelligence/);

  // Transcript is visible (source standup).
  await expect(page.getByText(/Backend load test/)).toBeVisible();

  // Switch the target language → open-map (Spanish) translation appears.
  await page.getByLabel("Translate to").selectOption("es");
  await expect(page.getByText(/La prueba de carga del backend/)).toBeVisible();

  // Go live → the SSE stream drives the caption/intel feed.
  await page.getByRole("button", { name: "Go live" }).click();
  await expect(page.getByRole("button", { name: "Live" })).toBeVisible();

  // Analysis report surfaces (scorecard).
  await expect(page.getByText("AI scorecard")).toBeVisible();
});
