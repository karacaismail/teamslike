import { test, expect } from "@playwright/test";

async function login(page) {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Welcome back", { exact: false })).toBeVisible();
}

test("docs: Clips tab lists async video clips", async ({ page }) => {
  await login(page);
  await page.getByRole("link", { name: "Docs & Projects" }).click();
  await expect(page).toHaveURL(/docs/);
  await page.getByRole("tab", { name: "Clips" }).click();
  await expect(page.getByText("Feature walkthrough", { exact: false })).toBeVisible();
});
