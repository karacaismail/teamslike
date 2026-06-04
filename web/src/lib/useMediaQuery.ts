import { useEffect, useState } from "react";

/**
 * Viewport contract. The shell's desktop/mobile divide is Tailwind's `md`
 * breakpoint (768px). Anything below is treated as a compact/mobile layout.
 */
export const MD_BREAKPOINT = 768;

/**
 * Subscribe to a CSS media query and re-render on change.
 *
 * SSR/test-safe: when `matchMedia` is unavailable (e.g. jsdom without a
 * polyfill) it resolves to `false` and never throws. That makes the mobile
 * branch strictly opt-in, so existing component tests keep rendering the
 * desktop tree unless they explicitly stub `matchMedia`.
 */
export function useMediaQuery(query: string): boolean {
  const read = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(read);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True on compact viewports (below Tailwind `md`). */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MD_BREAKPOINT - 1}px)`);
}
