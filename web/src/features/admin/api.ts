import { AUDIT_EVENTS, BILLING, FEDERATION, INVOICES, POLICIES, QUOTAS } from "./data";
import type { AuditEvent, BillingAccount, FederationLink, Invoice, Policy, Quota } from "./types";

/**
 * Mocks of the Admin FastAPI contract (`/admin/audit`, `/admin/policies`,
 * `/federation`, `/billing`). Dangerous mutations (payment, hard-delete) run on
 * the real backend with confirmation; the UI only presents the flow.
 */
const delay = <T>(value: T, ms = 120): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function fetchAudit(): Promise<AuditEvent[]> {
  return delay(AUDIT_EVENTS);
}
export function fetchPolicies(): Promise<Policy[]> {
  return delay(POLICIES);
}
export function fetchFederation(): Promise<FederationLink[]> {
  return delay(FEDERATION);
}
export function fetchBilling(): Promise<{ account: BillingAccount; invoices: Invoice[]; quotas: Quota[] }> {
  return delay({ account: BILLING, invoices: INVOICES, quotas: QUOTAS });
}
