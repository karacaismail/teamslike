import { test, expect } from "@playwright/test";

// Faz 6 plan E2E: event console → registration → live preview → poll + Q&A.
test("webinar: console → registration → live preview", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("link", { name: "Webinar" }).click();
  await expect(page).toHaveURL(/webinar/);
  await expect(page.getByText(/AURA Product Launch/).first()).toBeVisible();

  // Registration tab → form preview shows fields.
  await page.getByRole("tab", { name: "Registration" }).click();
  await expect(page.getByText("Registration form")).toBeVisible();

  // Switch to attendee live preview → poll + Q&A surface.
  await page.getByRole("tab", { name: "Live preview" }).click();
  await expect(page.getByText("Q&A")).toBeVisible();
  await expect(page.getByText(/What should we ship next/)).toBeVisible();
});
