import { create } from "zustand";
import { persist } from "zustand/middleware";
import { detectInitialLocale } from "@/lib/locale";

export type Theme = "light" | "dark" | "high-contrast";
export type Density = "comfortable" | "compact";
export type Locale = "en" | "tr";

interface UIState {
  theme: Theme;
  density: Density;
  locale: Locale;
  paletteOpen: boolean;
  copilotOpen: boolean;
  /** Per-surface unsaved-work flags (J6). Drives the in-app nav guard. */
  dirty: Record<string, boolean>;
  setTheme: (t: Theme) => void;
  setDensity: (d: Density) => void;
  setLocale: (l: Locale) => void;
  togglePalette: () => void;
  setPaletteOpen: (open: boolean) => void;
  toggleCopilot: () => void;
  setCopilotOpen: (open: boolean) => void;
  setDirty: (key: string, isDirty: boolean) => void;
}

/** UI preferences persist across reloads (J1): theme, density, language. */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "light",
      density: "comfortable",
      locale: detectInitialLocale(),
      paletteOpen: false,
      copilotOpen: true,
      dirty: {},
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      setLocale: (locale) => set({ locale }),
      togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
      toggleCopilot: () => set((s) => ({ copilotOpen: !s.copilotOpen })),
      setCopilotOpen: (copilotOpen) => set({ copilotOpen }),
      setDirty: (key, isDirty) =>
        set((s) => {
          if (!!s.dirty[key] === isDirty) return {};
          return { dirty: { ...s.dirty, [key]: isDirty } };
        }),
    }),
    {
      name: "aura-ui",
      partialize: (s) => ({ theme: s.theme, density: s.density, locale: s.locale }),
    },
  ),
);
