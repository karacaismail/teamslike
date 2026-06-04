import { test, expect } from "@playwright/test";

// Faz 7 plan E2E: event type console → public booking page → confirm.
test("scheduling: console → public booking → confirm", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("link", { name: "Scheduling" }).click();
  await expect(page).toHaveURL(/scheduling/);
  await expect(page.getByText("Intro call").first()).toBeVisible();

  // Switch to the public booking page.
  await page.getByRole("tab", { name: "Booking page" }).click();
  await expect(page.getByRole("heading", { name: "Intro call" })).toBeVisible();

  // Pick the first available slot (next weekday default), fill invitee, confirm.
  const slot = page.getByRole("option").first();
  if (await slot.count()) {
    await slot.click();
    await page.getByLabel("Your name").fill("Sam Rivera");
    await page.getByLabel("Your email").fill("sam@example.com");
    await page.getByRole("button", { name: "Confirm booking" }).click();
    await expect(page.getByText("You're booked!")).toBeVisible();
  }
});
