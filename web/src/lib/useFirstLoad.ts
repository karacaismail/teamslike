import { useEffect, useState } from "react";

/**
 * Brief "first paint" flag for showing a loading skeleton.
 *
 * The mock app renders synchronously from store seeds, so without a small
 * deliberate delay the skeleton would never be seen. This hook returns `true`
 * for a short window after the first mount, then flips to `false`.
 *
 * Under the test runner (`import.meta.env.MODE === "test"`) it is `false` from
 * the very first render, so component tests assert against real content and
 * never race the skeleton. The same instant-false path is taken when the user
 * prefers reduced motion — a skeleton flash is exactly the kind of transient
 * motion that setting asks us to avoid.
 *
 * @param ms how long the skeleton shows on first mount (default 480ms)
 */
export function useFirstLoad(ms = 480): boolean {
  const instant =
    import.meta.env.MODE === "test" ||
    (typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const [loading, setLoading] = useState(!instant);

  useEffect(() => {
    if (instant) return;
    const id = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(id);
  }, [instant, ms]);

  return loading;
}
