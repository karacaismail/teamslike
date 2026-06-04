import { test, expect } from "@playwright/test";

// Faz 10 E2E: admin console → audit → security policy change (type-to-confirm).
test("admin: overview → audit → toggle policy with confirmation", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page).toHaveURL(/admin/);
  await expect(page.getByText("storage_gb")).toBeVisible();

  // Audit tab.
  await page.getByRole("tab", { name: "Audit log" }).click();
  await expect(page.getByText("policy.update")).toBeVisible();

  // Security → enable E2EE with type-to-confirm (dangerous-action pattern).
  await page.getByRole("tab", { name: "Security" }).click();
  await page.getByRole("button", { name: "Enable" }).first().click();
  await page.getByLabel(/Type .* to confirm/).fill("E2EE");
  await page.getByRole("button", { name: "Confirm" }).click();
});
