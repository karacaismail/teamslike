/**
 * Sovereignty / Security / Admin bounded contexts (Faz 10).
 * Federation & Interop · Security & Compliance · Admin Console & Billing.
 * Cross-cutting governance over every tenant. FastAPI-compatible; dangerous
 * actions (payment, permission, hard-delete) are UI-flow only — executed on the
 * real backend with explicit confirmation, never here.
 */

export interface AuditEvent {
  id: string;
  tenantId: string;
  actorId: string;
  action: string; // e.g. "policy.update", "member.invite"
  resource: string;
  at: number; // epoch ms
  meta?: Record<string, string>;
  ip?: string; // audit-log IP column (Calendly differentiator)
}

export type PolicyKind =
  | "residency"
  | "retention"
  | "e2ee"
  // Microsoft-Purview-class governance (Teams parity)
  | "dlp" // data loss prevention (block sensitive content egress)
  | "sensitivity" // sensitivity labels (public → confidential → restricted)
  | "legalHold" // litigation / eDiscovery hold (immutable retention)
  | "infoBarrier" // information barriers (segment groups that may not communicate)
  | "commCompliance" // communication compliance (supervised chat / flagged terms)
  | "conditionalAccess"; // Entra-style conditional access (MFA / risk session)

/** Sensitivity-label tiers, least → most restricted. */
export type SensitivityLabel = "public" | "general" | "confidential" | "restricted";

export interface Policy {
  id: string;
  kind: PolicyKind;
  enabled: boolean;
  config: Record<string, string>;
}

export interface FederationLink {
  id: string;
  protocol: "matrix";
  remote: string;
  bridges: string[];
  connected: boolean;
}

export type Plan = "free" | "pro" | "business" | "enterprise";

export interface BillingAccount {
  plan: Plan;
  status: "active" | "past_due" | "trialing";
  seats: number;
  /** Transparent AI billing: included credits + published per-credit cost (USD). */
  aiCreditsIncluded: number;
  aiCreditsUsed: number;
  perCreditCost: number;
}

export interface InvoiceLine {
  label: string;
  amount: number;
}

export interface Invoice {
  id: string;
  period: string; // e.g. "2026-06"
  lines: InvoiceLine[];
  total: number;
}

export interface Quota {
  key: string;
  limit: number;
  used: number;
}

/**
 * Typed domain events = the admin contract.
 *
 *  PolicyChanged       → "policy.changed"
 *  BridgeConnected     → "bridge.connected"
 *  AuditEventRecorded  → "audit.recorded"
 *  SubscriptionUpdated → "subscription.updated"
 *  QuotaExceeded       → "quota.exceeded"
 */
export type AdminEvent =
  | { type: "policy.changed"; policyId: string; enabled: boolean }
  | { type: "bridge.connected"; linkId: string }
  | { type: "audit.recorded"; event: AuditEvent }
  | { type: "subscription.updated"; plan: Plan }
  | { type: "quota.exceeded"; key: string };
