#!/usr/bin/env node
/**
 * Dependency-boundary checker (zero-dependency, DDD guardrail).
 *
 * Enforces the architecture the plan/DoD promises but that nothing was checking
 * (no ESLint in the repo). Run in CI before tests.
 *
 * Rules:
 *  1. cross-feature: a file in features/<X> may NOT import @/features/<Y> (Y!=X).
 *     The ONLY allowed cross-context coupling is via @/features/integration
 *     (the anti-corruption / orchestration layer). Shared layers — @/lib,
 *     @/components, @/data, @/store, @/types, @/i18n — are always allowed.
 *  2. icons: only src/lib/icons.ts may import "@phosphor-icons/react[/...]".
 *     Everything else must import icons from "@/lib/icons".
 *
 * Tests (src/test, *.test.*) are exempt. Files directly under src/ or in
 * routes/ components/ etc. are not "in a feature", so wiring feature pages from
 * the router is allowed.
 */
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(fileURLToPath(new URL("..", import.meta.url)), "src");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const isTest = (rel) => /(^|\/)test\//.test(rel) || /\.test\.(ts|tsx)$/.test(rel);
const SPEC_RE = /(?:from\s*|import\s*\(\s*)["']([^"']+)["']/g;

const violations = [];
for (const file of walk(SRC)) {
  const rel = relative(SRC, file).split(sep).join("/");
  if (isTest(rel)) continue;
  const featM = rel.match(/^features\/([^/]+)\//);
  const srcFeat = featM ? featM[1] : null;
  const text = readFileSync(file, "utf8");
  let m;
  while ((m = SPEC_RE.exec(text))) {
    const spec = m[1];

    // Rule 2 — raw icon package
    if (spec === "@phosphor-icons/react" || spec.startsWith("@phosphor-icons/react/")) {
      if (rel !== "lib/icons.ts")
        violations.push(`${rel}\n    imports "${spec}" — use "@/lib/icons" instead`);
      continue;
    }

    // Rule 1 — cross-feature
    const tgtM = spec.match(/^@\/features\/([^/]+)/);
    if (!tgtM) continue;
    if (spec === "@/features/integration" || spec.startsWith("@/features/integration")) continue;
    const tgtFeat = tgtM[1];
    if (srcFeat && tgtFeat !== srcFeat)
      violations.push(`${rel}\n    imports "${spec}" — ${srcFeat} must not depend on ${tgtFeat}; route via @/features/integration or a shared layer`);
  }
}

if (violations.length) {
  console.error(`\n✗ boundary check failed — ${violations.length} violation(s):\n`);
  for (const v of violations) console.error("  • " + v + "\n");
  console.error("Allowed cross-context coupling: @/features/integration. Shared: @/lib @/components @/data @/store @/types @/i18n.\n");
  process.exit(1);
}
console.log("✓ boundary check passed — no illegal cross-feature or raw-icon imports.");
