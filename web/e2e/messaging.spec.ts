import { test, expect } from "@playwright/test";

async function login(page) {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Welcome back", { exact: false })).toBeVisible();
}

test("messaging: open from nav and see a channel", async ({ page }) => {
  await login(page);
  await page.getByRole("link", { name: "Messaging" }).click();
  await expect(page).toHaveURL(/messaging/);
  await expect(page.getByText("product", { exact: false }).first()).toBeVisible();
});

test("messaging: deep-link restores the selected channel (J2)", async ({ page }) => {
  await login(page);
  await page.goto("/messaging?c=ch_eng&t=tp_rfc");
  await expect(page).toHaveURL(/c=ch_eng/);
  await expect(page.getByText("engineering", { exact: false }).first()).toBeVisible();
});
