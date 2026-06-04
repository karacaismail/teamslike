import type { AuditEvent, Policy, SensitivityLabel } from "./types";

/** Pure Admin / Security / Billing domain helpers — framework-free, unit-testable. */

export type QuotaLevel = "ok" | "warn" | "exceeded";

/** Quota usage level (warn at ≥80%, exceeded at ≥100%). */
export function quotaState(used: number, limit: number): QuotaLevel {
  if (limit <= 0) return "ok";
  if (used >= limit) return "exceeded";
  return used / limit >= 0.8 ? "warn" : "ok";
}

/** Plan-change proration for the remaining days of the period. */
export function proration(oldPrice: number, newPrice: number, daysLeft: number, daysInPeriod: number): number {
  if (daysInPeriod <= 0) return 0;
  return Math.round(((newPrice - oldPrice) * daysLeft / daysInPeriod) * 100) / 100;
}

/** Filter audit log by actor (exact) and/or action (substring, case-insensitive). */
export function filterAudit(events: AuditEvent[], filters: { actorId?: string; action?: string }): AuditEvent[] {
  return events.filter(
    (e) =>
      (!filters.actorId || e.actorId === filters.actorId) &&
      (!filters.action || e.action.toLowerCase().includes(filters.action.toLowerCase())),
  );
}

/** Whether data older than the retention window should be purged. */
export function retentionExpired(ageDays: number, retentionDays: number): boolean {
  return ageDays > retentionDays;
}

/** Data-residency check: an enabled residency policy must match the region. */
export function residencyAllowed(policy: Policy, region: string): boolean {
  if (policy.kind !== "residency" || !policy.enabled) return true;
  return policy.config.region === region;
}

/* ───────────── Purview-class governance (Teams parity) ───────────── */

export type DlpKind = "iban" | "card" | "tckn" | "email";
export interface DlpFinding {
  kind: DlpKind;
  match: string;
}

/** Linear, ReDoS-safe DLP patterns, checked in priority order. */
const DLP_PATTERNS: { kind: DlpKind; re: RegExp }[] = [
  { kind: "iban", re: /\bTR\d{2}(?: ?\d{4}){5} ?\d{2}\b/gi },
  { kind: "card", re: /\b(?:\d{4}[ -]){3}\d{4}\b|\b\d{13,16}\b/g },
  { kind: "tckn", re: /\b\d{11}\b/g },
  { kind: "email", re: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
];

/** Scan text for sensitive tokens (card/IBAN/TC kimlik/email) a DLP policy would block. */
export function dlpScan(text: string): DlpFinding[] {
  const findings: DlpFinding[] = [];
  for (const { kind, re } of DLP_PATTERNS) {
    for (const m of text.matchAll(re)) findings.push({ kind, match: m[0] });
  }
  return findings;
}

/** Mask every DLP hit with `mask` (for safe display / egress blocking). */
export function dlpRedact(text: string, mask = "•••"): string {
  let out = text;
  for (const { re } of DLP_PATTERNS) out = out.replace(new RegExp(re.source, re.flags), mask);
  return out;
}

const SENSITIVITY_ORDER: SensitivityLabel[] = ["public", "general", "confidential", "restricted"];

/** Rank a sensitivity label 0 (public) … 3 (restricted). */
export function sensitivityRank(label: SensitivityLabel): number {
  return SENSITIVITY_ORDER.indexOf(label);
}

/** Whether downgrading from `from` to `to` is blocked (labels may only go up). */
export function sensitivityDowngradeBlocked(from: SensitivityLabel, to: SensitivityLabel): boolean {
  return sensitivityRank(to) < sensitivityRank(from);
}

/** Information barriers: are groups A and B forbidden from communicating? */
export function barrierBlocks(a: string, b: string, barriers: [string, string][]): boolean {
  if (a === b) return false;
  return barriers.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

/** Communication-compliance: does a message hit any supervised/blocked term? */
export function flaggedTerms(text: string, terms: string[]): string[] {
  const t = text.toLowerCase();
  return terms.filter((w) => w.trim() && t.includes(w.trim().toLowerCase()));
}

/* ───────────── Transparent AI billing (included credits, no per-resolution) ───────────── */

/** AI-credit usage level — reuses the quota thresholds (warn ≥80%, exceeded ≥100%). */
export function aiCreditState(used: number, included: number): QuotaLevel {
  return quotaState(used, included);
}

/** Overage cost (USD) for credits consumed beyond the included allowance. */
export function creditOverage(used: number, included: number, perCreditCost: number): number {
  const over = Math.max(0, used - included);
  return Math.round(over * perCreditCost * 100) / 100;
}
