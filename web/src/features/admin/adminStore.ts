import { create } from "zustand";
import { AUDIT_EVENTS, BILLING, FEDERATION, INVOICES, POLICIES, QUOTAS } from "./data";
import type { AdminEvent, AuditEvent, BillingAccount, FederationLink, Invoice, Plan, Policy, Quota } from "./types";

let seq = 0;
const aid = () => `au_${Date.now()}_${seq++}`;
const cloneAudit = (): AuditEvent[] => AUDIT_EVENTS.map((e) => ({ ...e }));
const clonePolicies = (): Policy[] => POLICIES.map((p) => ({ ...p, config: { ...p.config } }));
const cloneFed = (): FederationLink[] => FEDERATION.map((f) => ({ ...f, bridges: [...f.bridges] }));

interface AdminState {
  audit: AuditEvent[];
  policies: Policy[];
  federation: FederationLink[];
  billing: BillingAccount;
  invoices: Invoice[];
  quotas: Quota[];

  recordAudit: (action: string, resource: string, actorId: string) => void;
  togglePolicy: (id: string) => void;
  setPolicyConfig: (id: string, key: string, value: string) => void;
  addBridge: (linkId: string, bridge: string) => void;
  /** UI flow only — no real payment is taken here. */
  upgradePlan: (plan: Plan) => void;
  applyEvent: (evt: AdminEvent) => void;
  reset: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  audit: cloneAudit(),
  policies: clonePolicies(),
  federation: cloneFed(),
  billing: { ...BILLING },
  invoices: INVOICES.map((i) => ({ ...i })),
  quotas: QUOTAS.map((q) => ({ ...q })),

  recordAudit: (action, resource, actorId) =>
    set((s) => ({ audit: [{ id: aid(), tenantId: "t1", actorId, action, resource, at: Date.now() }, ...s.audit] })),

  togglePolicy: (id) => {
    set((s) => ({ policies: s.policies.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)) }));
    get().recordAudit("policy.update", id, "usr_1");
  },
  setPolicyConfig: (id, key, value) =>
    set((s) => ({ policies: s.policies.map((p) => (p.id === id ? { ...p, config: { ...p.config, [key]: value } } : p)) })),
  addBridge: (linkId, bridge) => {
    set((s) => ({
      federation: s.federation.map((f) =>
        f.id === linkId && !f.bridges.includes(bridge) ? { ...f, bridges: [...f.bridges, bridge] } : f,
      ),
    }));
    get().recordAudit("federation.bridge", bridge, "usr_1");
  },
  upgradePlan: (plan) => {
    set((s) => ({ billing: { ...s.billing, plan } }));
    get().recordAudit("subscription.update", plan, "usr_1");
  },

  applyEvent: (evt) =>
    set((s) => {
      switch (evt.type) {
        case "policy.changed":
          return { policies: s.policies.map((p) => (p.id === evt.policyId ? { ...p, enabled: evt.enabled } : p)) };
        case "audit.recorded":
          return s.audit.some((a) => a.id === evt.event.id) ? {} : { audit: [evt.event, ...s.audit] };
        case "subscription.updated":
          return { billing: { ...s.billing, plan: evt.plan } };
        default:
          return {};
      }
    }),

  reset: () =>
    set({
      audit: cloneAudit(),
      policies: clonePolicies(),
      federation: cloneFed(),
      billing: { ...BILLING },
      invoices: INVOICES.map((i) => ({ ...i })),
      quotas: QUOTAS.map((q) => ({ ...q })),
    }),
}));
