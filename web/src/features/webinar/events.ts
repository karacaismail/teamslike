import type { AgendaItem, TicketTier } from "./types";

/**
 * Pure Events helpers (ticket math, multi-currency revenue, agenda grouping &
 * conflict detection). Framework-free → unit-testable.
 */

/** Tickets still available in a tier. */
export function ticketsRemaining(tier: TicketTier): number {
  return Math.max(0, tier.quantity - tier.sold);
}

/** Sold-out check. */
export function isSoldOut(tier: TicketTier): boolean {
  return ticketsRemaining(tier) === 0;
}

/** Revenue per currency = Σ(sold × price), keyed by ISO currency. */
export function ticketRevenue(tiers: TicketTier[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const tier of tiers) {
    out[tier.currency] = (out[tier.currency] ?? 0) + tier.sold * tier.price;
  }
  return out;
}

/** Localized money string (fixed en-US locale; currency drives the symbol). */
export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/** "HH:MM" → minutes from midnight. */
function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Group agenda items by day, preserving first-seen day order. */
export function agendaByDay(items: AgendaItem[]): { day: string; items: AgendaItem[] }[] {
  const order: string[] = [];
  const map = new Map<string, AgendaItem[]>();
  for (const it of items) {
    if (!map.has(it.day)) {
      map.set(it.day, []);
      order.push(it.day);
    }
    map.get(it.day)!.push(it);
  }
  return order.map((day) => ({
    day,
    items: map.get(day)!.slice().sort((a, b) => toMin(a.start) - toMin(b.start)),
  }));
}

/** Pairs of items that overlap within the same day+track (scheduling clashes). */
export function agendaConflicts(items: AgendaItem[]): [AgendaItem, AgendaItem][] {
  const clashes: [AgendaItem, AgendaItem][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      if (a.day !== b.day || a.track !== b.track) continue;
      const aS = toMin(a.start);
      const aE = toMin(a.end);
      const bS = toMin(b.start);
      const bE = toMin(b.end);
      if (aS < bE && bS < aE) clashes.push([a, b]);
    }
  }
  return clashes;
}
