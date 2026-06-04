import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@/i18n";
import i18n from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { readableOn } from "@/lib/themeColors";

beforeEach(() => {
  i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
});

describe("readableOn", () => {
  it("keeps text legible on bright and dark accents", () => {
    expect(readableOn("#FFFF00")).toBe("#000000"); // yellow → dark text
    expect(readableOn("#000000")).toBe("#ffffff"); // black → light text
    expect(readableOn("#0000FF")).toBe("#ffffff"); // blue → light text
  });
});

describe("ProfilePage RBAC", () => {
  it("lets an owner switch the demo role", () => {
    useAuthStore.getState().setRole("owner");
    render(<ProfilePage />);
    expect(screen.getByRole("button", { name: /Owner/i })).toBeTruthy();
  });

  it("locks the role for non-admins", () => {
    useAuthStore.getState().setRole("member");
    render(<ProfilePage />);
    expect(screen.getByText(/Only admins can change roles/i)).toBeTruthy();
  });
});

describe("uiStore accent colour", () => {
  it("sets and clears the user accent", () => {
    useUIStore.getState().setAccentColor("#FF0000");
    expect(useUIStore.getState().accentColor).toBe("#FF0000");
    useUIStore.getState().setAccentColor(null);
    expect(useUIStore.getState().accentColor).toBeNull();
  });
});
