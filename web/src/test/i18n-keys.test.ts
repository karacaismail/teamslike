import { describe, it, expect } from "vitest";
import { en } from "@/i18n/en";
import { tr } from "@/i18n/tr";

/**
 * Guards against the "raw key leaks to the screen" class of bug (e.g. a
 * component calling t("messaging.typing") when that key was never added). We
 * statically scan the source for literal t("a.b.c") keys and assert each one
 * resolves in both locales. Dynamic keys (template literals) are out of scope.
 */
const files = import.meta.glob("../**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function resolve(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, seg) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[seg] : undefined,
      obj,
    );
}

const KEY_RE = /\bt\(\s*["']([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+)["']/g;
const referenced = new Set<string>();
for (const [path, src] of Object.entries(files)) {
  if (path.includes("/test/")) continue;
  let m: RegExpExecArray | null;
  while ((m = KEY_RE.exec(src))) referenced.add(m[1]);
}

describe("i18n key integrity", () => {
  it("scans a non-trivial number of keys", () => {
    expect(referenced.size).toBeGreaterThan(50);
  });

  it("every statically referenced t() key exists in en", () => {
    const missing = [...referenced].filter((k) => resolve(en, k) === undefined).sort();
    expect(missing, `Missing in en: ${missing.join(", ")}`).toEqual([]);
  });

  it("every statically referenced t() key exists in tr", () => {
    const missing = [...referenced].filter((k) => resolve(tr, k) === undefined).sort();
    expect(missing, `Missing in tr: ${missing.join(", ")}`).toEqual([]);
  });
});
