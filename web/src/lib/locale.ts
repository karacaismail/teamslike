/**
 * Initial-locale detection (J7). Priority:
 *   1. persisted UI preference (localStorage "aura-ui" → state.locale)
 *   2. browser/OS language (TR gets priority for the target market)
 *   3. "en" fallback
 * Kept dependency-free and side-effect-free so i18n init and the UI store can
 * agree on the same starting language.
 */
export type Locale = "en" | "tr";

export function detectInitialLocale(): Locale {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem("aura-ui") : null;
    if (raw) {
      const persisted = JSON.parse(raw)?.state?.locale;
      if (persisted === "tr" || persisted === "en") return persisted;
    }
  } catch {
    /* ignore malformed storage */
  }
  const nav = typeof navigator !== "undefined" ? (navigator.language || "").toLowerCase() : "";
  return nav.startsWith("tr") ? "tr" : "en";
}
