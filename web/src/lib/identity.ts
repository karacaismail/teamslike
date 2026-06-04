import { TEAM } from "@/data/team";
import type { TeamMember, Presence } from "@/types/domain";

/**
 * Identity read model — the single platform-level accessor for member identity.
 *
 * Sourced from the Tenancy seed (data/team.ts) and deliberately placed in lib/
 * (shared kernel), NOT inside any bounded context. Meetings, Intelligence,
 * Scheduling and Docs read member identity from here instead of reaching into
 * Messaging, so no domain depends on another domain for identity.
 * Cross-feature import boundaries are enforced by scripts/check-boundaries.mjs.
 */
export const memberById = (id: string): TeamMember | undefined =>
  TEAM.find((m) => m.id === id);

export const memberName = (id: string): string => memberById(id)?.name ?? id;

export const presenceOf = (id: string): Presence | undefined =>
  memberById(id)?.presence;
