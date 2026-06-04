import { test, expect } from "@playwright/test";

// Faz 5 plan E2E: dial → active call → hold → hang up.
test("phone: dial → active call → hold → hang up", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("link", { name: "Phone" }).click();
  await expect(page).toHaveURL(/telephony/);

  // Type a number on the keypad and place the call.
  for (const d of ["6", "2", "8", "5", "5", "5", "0", "1", "9", "9"]) {
    await page.getByRole("button", { name: d, exact: true }).first().click();
  }
  await page.getByRole("button", { name: "Call" }).click();

  // Global active-call bar appears with hold + hang-up controls.
  await expect(page.getByRole("button", { name: "Hang up" })).toBeVisible();
  await page.getByRole("button", { name: "Hold" }).click();
  await page.getByRole("button", { name: "Hang up" }).click();
  await expect(page.getByRole("button", { name: "Hang up" })).toHaveCount(0);
});
