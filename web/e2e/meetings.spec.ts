import { test, expect } from "@playwright/test";

async function login(page) {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Welcome back", { exact: false })).toBeVisible();
}

test("meetings: open from nav", async ({ page }) => {
  await login(page);
  await page.getByRole("link", { name: "Meetings" }).click();
  await expect(page).toHaveURL(/meetings/);
});
