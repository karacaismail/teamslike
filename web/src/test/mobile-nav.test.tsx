import { describe, it, expect, beforeAll } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@/i18n";
import i18n from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { MobileNav } from "@/components/shell/MobileNav";

beforeAll(() => {
  i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});

const wrap = (
  <MemoryRouter>
    <MobileNav />
  </MemoryRouter>
);

describe("MobileNav", () => {
  it("puts the first domains on the bar plus a More control", () => {
    render(wrap);
    // Dashboard is the first RBAC-permitted domain → reachable from the bar.
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "More" })).toBeTruthy();
  });

  it("reveals the full nav (incl. later domains) via the More sheet", () => {
    render(wrap);
    fireEvent.click(screen.getByRole("button", { name: "More" }));
    const dialog = screen.getByRole("dialog", { name: "Primary navigation" });
    // Admin sits past the bar cut-off, so it only appears once the sheet opens.
    expect(within(dialog).getByRole("link", { name: /Admin/ })).toBeTruthy();
  });
});
