import type { AvailabilitySchedule, Booking, EventType, Slot } from "./types";

/** Pure Scheduling-domain helpers — framework-free, unit-testable. */

/**
 * Generate bookable slots for a date: weekday rule (or date override), stepped by
 * duration + buffers, filtered by min-notice relative to `nowMs`. Times are in the
 * schedule's local frame (the backend resolves the invitee timezone).
 */
export function generateSlots(
  schedule: AvailabilitySchedule,
  eventType: EventType,
  dateISO: string,
  nowMs: number = Date.now(),
): Slot[] {
  const day = new Date(`${dateISO}T00:00:00`);
  const dayMs = day.getTime();
  const weekday = day.getDay();

  let startMin: number;
  let endMin: number;
  const override = schedule.overrides.find((o) => o.date === dateISO);
  if (override) {
    if (!override.available) return [];
    if (override.startMin != null && override.endMin != null) {
      startMin = override.startMin;
      endMin = override.endMin;
    } else {
      const rule = schedule.rules.find((r) => r.weekday === weekday);
      if (!rule) return [];
      startMin = rule.startMin;
      endMin = rule.endMin;
    }
  } else {
    const rule = schedule.rules.find((r) => r.weekday === weekday);
    if (!rule) return [];
    startMin = rule.startMin;
    endMin = rule.endMin;
  }

  const step = eventType.durationMin + eventType.bufferBefore + eventType.bufferAfter;
  const out: Slot[] = [];
  for (let s = startMin; s + eventType.durationMin <= endMin; s += step) {
    const startMs = dayMs + s * 60_000;
    if (startMs - nowMs >= eventType.minNoticeMin * 60_000) {
      out.push({ startMs, endMs: startMs + eventType.durationMin * 60_000 });
    }
  }
  return out;
}

/** Overlap detection against existing bookings (adjacency is NOT a conflict). */
export function hasConflict(slot: Slot, bookings: { startMs: number; endMs: number }[]): boolean {
  return bookings.some((b) => slot.startMs < b.endMs && slot.endMs > b.startMs);
}

/** Round-robin host selection (wraps). */
export function pickRoundRobin(hostIds: string[], lastIndex: number): string {
  return hostIds[(lastIndex + 1) % hostIds.length];
}

/** Move a booking to a new start, recompute end, flag as rescheduled. */
export function rescheduleBooking(booking: Booking, newStartMs: number, durationMin: number): Booking {
  return { ...booking, startMs: newStartMs, endMs: newStartMs + durationMin * 60_000, status: "rescheduled" };
}

/** Best-effort browser timezone detection (override-able in the UI). */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
