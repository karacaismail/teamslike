import { TEAM } from "@/data/team";
import type { Presence } from "@/types/domain";

/**
 * Presence open-host service (A2) — a cross-cutting platform capability instead
 * of a field scattered across feature components. Reads from the Tenancy seed
 * via identity; a real backend swaps `subscribePresence` for a WS/SSE feed
 * without touching callers.
 */
export { presenceOf } from "@/lib/identity";

export function presenceSummary(): Record<Presence, number> {
  const acc: Record<Presence, number> = { online: 0, away: 0, offline: 0 };
  for (const m of TEAM) acc[m.presence] += 1;
  return acc;
}

/** Mock subscription: delivers the current snapshot, returns an unsubscribe. */
export function subscribePresence(cb: (snapshot: Record<string, Presence>) => void): () => void {
  const snap: Record<string, Presence> = {};
  for (const m of TEAM) snap[m.id] = m.presence;
  cb(snap);
  return () => {};
}
