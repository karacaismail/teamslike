import { describe, it, expect, beforeEach } from "vitest";
import { detectInitialLocale } from "@/lib/locale";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";

describe("locale detection (J7)", () => {
  beforeEach(() => localStorage.clear());

  it("prefers a persisted UI locale over the browser default", () => {
    localStorage.setItem("aura-ui", JSON.stringify({ state: { locale: "tr" }, version: 0 }));
    expect(detectInitialLocale()).toBe("tr");
  });

  it("degrades gracefully on malformed storage", () => {
    localStorage.setItem("aura-ui", "{ not json");
    const l = detectInitialLocale();
    expect(l === "en" || l === "tr").toBe(true);
  });
});

describe("preference & session persistence (J1)", () => {
  beforeEach(() => localStorage.clear());

  it("persists a theme change to localStorage", () => {
    useUIStore.getState().setTheme("dark");
    const raw = localStorage.getItem("aura-ui");
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).state.theme).toBe("dark");
    useUIStore.getState().setTheme("light"); // restore
  });

  it("persists the session on login so a reload keeps the user signed in", () => {
    useAuthStore.getState().login("ismail@aura.dev");
    expect(useAuthStore.getState().status).toBe("authenticated");
    const raw = localStorage.getItem("aura-auth");
    expect(JSON.parse(raw!).state.status).toBe("authenticated");
  });
});
