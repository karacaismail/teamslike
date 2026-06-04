import type { AuditEvent, BillingAccount, FederationLink, Invoice, Policy, Quota } from "./types";

const MIN = 60_000;
const base = Date.now();

export const AUDIT_EVENTS: AuditEvent[] = [
  { id: "au1", tenantId: "t1", ip: "10.0.0.1", actorId: "usr_1", action: "auth.login", resource: "session", at: base - 5 * MIN },
  { id: "au2", tenantId: "t1", ip: "10.0.0.2", actorId: "usr_1", action: "policy.update", resource: "retention", at: base - 40 * MIN, meta: { days: "90" } },
  { id: "au3", tenantId: "t1", ip: "10.0.0.3", actorId: "usr_2", action: "member.invite", resource: "usr_9", at: base - 120 * MIN },
  { id: "au4", tenantId: "t1", ip: "10.0.0.4", actorId: "usr_1", action: "federation.connect", resource: "matrix.org", at: base - 240 * MIN },
  { id: "au5", tenantId: "t1", ip: "10.0.0.5", actorId: "usr_3", action: "billing.view", resource: "invoice", at: base - 1440 * MIN },
];

export const POLICIES: Policy[] = [
  { id: "pol_res", kind: "residency", enabled: true, config: { region: "EU" } },
  { id: "pol_ret", kind: "retention", enabled: true, config: { days: "90" } },
  { id: "pol_e2ee", kind: "e2ee", enabled: false, config: { scope: "dm" } },
  { id: "pol_dlp", kind: "dlp", enabled: true, config: { detect: "card,iban,tckn", action: "block+notify" } },
  { id: "pol_sens", kind: "sensitivity", enabled: true, config: { default: "general", labels: "public,general,confidential,restricted" } },
  { id: "pol_legal", kind: "legalHold", enabled: false, config: { custodians: "finance,legal", scope: "chat+files" } },
  { id: "pol_barrier", kind: "infoBarrier", enabled: false, config: { segments: "Research|Sales" } },
  { id: "pol_comm", kind: "commCompliance", enabled: false, config: { terms: "insider,bribe,leak", review: "supervisor" } },
  { id: "pol_ca", kind: "conditionalAccess", enabled: true, config: { mfa: "required", risk: "block-high" } },
];

export const FEDERATION: FederationLink[] = [
  { id: "fed_matrix", protocol: "matrix", remote: "matrix.org", bridges: ["slack", "teams"], connected: true },
];

export const BILLING: BillingAccount = {
  plan: "business",
  status: "active",
  seats: 42,
  aiCreditsIncluded: 5000,
  aiCreditsUsed: 4300,
  perCreditCost: 0.01, // published, not per-resolution
};

export const INVOICES: Invoice[] = [
  {
    id: "inv_2026_06",
    period: "2026-06",
    lines: [
      { label: "Business plan × 42 seats", amount: 924 },
      { label: "AI add-on", amount: 120 },
    ],
    total: 1044,
  },
];

export const QUOTAS: Quota[] = [
  { key: "storage_gb", limit: 100, used: 82 },
  { key: "ai_actions", limit: 1000, used: 1000 },
  { key: "seats", limit: 50, used: 42 },
];

export const PLAN_PRICES: Record<string, number> = { free: 0, pro: 8, business: 22, enterprise: 40 };
