import { test, expect } from "@playwright/test";

test("login → dashboard → messaging → meetings", async ({ page }) => {
  await page.goto("/");

  // Login (demo: any email)
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();

  // Dashboard
  await expect(page.getByText("Welcome back", { exact: false })).toBeVisible();

  // Navigate to Messaging
  await page.getByRole("link", { name: "Messaging" }).click();
  await expect(page).toHaveURL(/messaging/);

  // Start a meeting from the chat header (Faz 2 ↔ Faz 3 bridge)
  await page.getByRole("button", { name: "Meet" }).click();
  await expect(page).toHaveURL(/meetings/);
});

test("command palette opens with keyboard", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("listbox")).toBeVisible();
});
