import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests (run in CI; needs `npx playwright install chromium`).
 * Spins up the Vite dev server and drives a real browser — this is where
 * full WCAG checks (incl. color-contrast) run via axe.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
