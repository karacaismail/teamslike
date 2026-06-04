import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Real-browser color-contrast audit (A6). jsdom (vitest + jest-axe) cannot run
 * axe's color-contrast rule because it has no canvas, so contrast was never
 * actually verified despite the AAA goal. Playwright renders the real DOM, so
 * axe's `color-contrast` rule runs here for real.
 *
 * Enforces WCAG AA contrast (4.5:1) — the baseline that was previously unchecked.
 * To raise the bar to the project's AAA target, add "color-contrast-enhanced"
 * to the runOnly list once each surface has been verified at 7:1.
 */
const PAGES = ["/dashboard", "/messaging", "/meetings", "/scheduling", "/support", "/docs", "/admin"];

async function login(page: Page) {
  await page.goto("/");
  await page.getByLabel("Work email").fill("ismail@aura.dev");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Welcome back", { exact: false })).toBeVisible();
}

test.describe("color contrast (WCAG AA)", () => {
  for (const path of PAGES) {
    test(`no contrast violations on ${path}`, async ({ page }) => {
      await login(page);
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .options({ runOnly: { type: "rule", values: ["color-contrast"] } })
        .analyze();
      expect(
        results.violations,
        JSON.stringify(results.violations, null, 2),
      ).toEqual([]);
    });
  }
});
