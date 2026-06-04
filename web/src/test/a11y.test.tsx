import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import i18n from "@/i18n";
import "@/i18n";
import { LoginPage } from "@/routes/LoginPage";
import { DomainPage } from "@/routes/DomainPage";

// Focus on WCAG rule sets (our target). Color-contrast (needs layout) is
// verified in the browser via Playwright + axe in CI.
const WCAG = {
  runOnly: {
    type: "tag" as const,
    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
  },
};

beforeAll(async () => {
  await i18n.changeLanguage("en");
  // Satisfy document-level WCAG rules for isolated component renders.
  document.documentElement.lang = "en";
  document.title = "AURA";
});

describe("a11y (axe — WCAG)", () => {
  it("LoginPage has no WCAG violations", async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container, WCAG);
    expect(results.violations).toEqual([]);
  });

  it("Domain preview screen has no WCAG violations", async () => {
    const { container } = render(
      <main>
        <DomainPage domainKey="telephony" />
      </main>,
    );
    const results = await axe(container, WCAG);
    expect(results.violations).toEqual([]);
  });
});
