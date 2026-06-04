import type { RoleKey } from "@/types/domain";

/** Every permission used across the panel (Phase 1 + domain view gates). */
export const ALL_PERMISSIONS = [
  "dashboard.view",
  "messaging.view",
  "meetings.view",
  "intelligence.view",
  "telephony.view",
  "webinar.view",
  "scheduling.view",
  "support.view",
  "docs.view",
  "canvas.view",
  "admin.access",
  "ai.use",
  "members.view",
  "members.invite",
];

export interface RoleDef {
  key: RoleKey;
  labelKey: string;
  permissions: string[];
}

/**
 * Role → permission sets. Tiers are intentionally distinct so switching the
 * demo role visibly changes the UI (nav, command palette, screens).
 */
export const ROLES: Record<RoleKey, RoleDef> = {
  owner: {
    key: "owner",
    labelKey: "role.owner",
    permissions: ALL_PERMISSIONS,
  },
  admin: {
    key: "admin",
    labelKey: "role.admin",
    // Everything except inviting members (owner-only).
    permissions: ALL_PERMISSIONS.filter((p) => p !== "members.invite"),
  },
  member: {
    key: "member",
    labelKey: "role.member",
    // All product domains + AI + can see team; no admin, no invite.
    permissions: [
      "dashboard.view",
      "messaging.view",
      "meetings.view",
      "intelligence.view",
      "telephony.view",
      "webinar.view",
      "scheduling.view",
      "support.view",
      "docs.view",
      "canvas.view",
      "ai.use",
      "members.view",
    ],
  },
  guest: {
    key: "guest",
    labelKey: "role.guest",
    // Minimal: a couple of domains, no AI, no team, no admin.
    permissions: ["dashboard.view", "messaging.view", "meetings.view"],
  },
};

export const ROLE_ORDER: RoleKey[] = ["owner", "admin", "member", "guest"];
