import { test, expect } from "@playwright/test";

// Drive every test in this file at a phone viewport (iPhone 12 logical size).
test.use({ viewport: { width: 390, height: 844 } });

async function login(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Welcome back", { exact: false })).toBeVisible();
}

test("mobile: sidebar collapses and the bottom nav drives navigation", async ({ page }) => {
  await login(page);

  // The desktop sidebar is hidden below md…
  await expect(page.locator("aside")).toBeHidden();

  // …and the bottom nav takes over.
  const moreBtn = page.getByRole("button", { name: "More" });
  await expect(moreBtn).toBeVisible();

  // Tap a domain on the bar (scoped to the bottom nav to avoid dashboard cards).
  const bottomNav = page.locator("nav").filter({ has: moreBtn });
  await bottomNav.getByRole("link", { name: "Messaging" }).click();
  await expect(page).toHaveURL(/messaging/);

  // Messaging is single-pane on mobile: a Back control returns to the list.
  await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
});

test("mobile: the More sheet exposes the full domain list", async ({ page }) => {
  await login(page);

  await page.getByRole("button", { name: "More" }).click();
  const sheet = page.getByRole("dialog", { name: "Primary navigation" });
  await expect(sheet).toBeVisible();

  // Phone sits past the bar cut-off, so it is only reachable through the sheet.
  await sheet.getByRole("link", { name: "Phone" }).click();
  await expect(page).toHaveURL(/telephony/);
});
