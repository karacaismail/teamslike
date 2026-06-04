import type { Principal, Tenant, Workspace } from "@/types/domain";
import { ROLES } from "@/data/roles";

/**
 * Minimal, representative mock data — enough to make the panel clickable.
 * Bulk lists live in src/data/*.
 */

export const MOCK_PRINCIPAL: Principal = {
  id: "usr_1",
  email: "ismail@aura.dev",
  displayName: "Ismail K.",
  title: "Founder",
  locale: "en",
  role: "owner",
  permissions: ROLES.owner.permissions,
};

export const MOCK_TENANTS: Tenant[] = [
  {
    id: "tn_aura",
    slug: "aura",
    name: "Aura Labs",
    plan: "enterprise",
    region: "eu-central",
    branding: { accent: "#0b5394" }, // AAA on white
  },
  {
    id: "tn_north",
    slug: "north",
    name: "Northwind Co.",
    plan: "business",
    region: "eu-west",
    branding: { accent: "#5b21b6" }, // AAA on white
  },
];

export const MOCK_WORKSPACES: Workspace[] = [
  { id: "ws_core", tenantId: "tn_aura", slug: "core", name: "Core Team" },
  { id: "ws_growth", tenantId: "tn_aura", slug: "growth", name: "Growth" },
  { id: "ws_ops", tenantId: "tn_north", slug: "ops", name: "Operations" },
];

/** Per-domain headline numbers shown on placeholder screens (no detail rows). */
export const MOCK_DOMAIN_STATS: Record<string, { labelKey: string; value: string }[]> = {
  dashboard: [
    { labelKey: "stat.activeWorkspaces", value: "2" },
    { labelKey: "stat.openItems", value: "7" },
    { labelKey: "stat.aiActions", value: "23" },
  ],
  messaging: [
    { labelKey: "stat.channels", value: "3" },
    { labelKey: "stat.unread", value: "5" },
    { labelKey: "stat.mentions", value: "2" },
  ],
  meetings: [
    { labelKey: "stat.today", value: "4" },
    { labelKey: "stat.recordings", value: "11" },
  ],
  intelligence: [
    { labelKey: "stat.languages", value: "70+" },
    { labelKey: "stat.transcripts", value: "18" },
  ],
  telephony: [
    { labelKey: "stat.lines", value: "1" },
    { labelKey: "stat.voicemails", value: "2" },
  ],
  webinar: [
    { labelKey: "stat.capacity", value: "100k" },
    { labelKey: "stat.registrations", value: "342" },
  ],
  scheduling: [
    { labelKey: "stat.eventTypes", value: "2" },
    { labelKey: "stat.bookings", value: "9" },
  ],
  support: [
    { labelKey: "stat.openConversations", value: "6" },
    { labelKey: "stat.csat", value: "94%" },
  ],
  docs: [
    { labelKey: "stat.docs", value: "5" },
    { labelKey: "stat.boards", value: "2" },
  ],
  admin: [
    { labelKey: "stat.members", value: "6" },
    { labelKey: "stat.auditEvents", value: "128" },
  ],
};
