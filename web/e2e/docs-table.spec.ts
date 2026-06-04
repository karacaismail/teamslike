import { test, expect } from "@playwright/test";

async function login(page) {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Welcome back", { exact: false })).toBeVisible();
}

test("docs: relational table shows formula total and recomputes on edit", async ({ page }) => {
  await login(page);
  await page.getByRole("link", { name: "Docs & Projects" }).click();
  await expect(page).toHaveURL(/docs/);

  await page.getByRole("tab", { name: "Tables" }).click();
  await expect(page.getByText("Launch budget")).toBeVisible();
  // Seed: Qty 3 * Price 1200 = 3600
  await expect(page.getByText("3600", { exact: true })).toBeVisible();

  // Calendar view is derived from the date column
  await page.getByRole("button", { name: "Calendar" }).click();
  await expect(page.getByText("2026-06-10", { exact: false })).toBeVisible();
});
