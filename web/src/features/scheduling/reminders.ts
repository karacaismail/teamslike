/**
 * Booking reminder rules + conflict detection (Calendly workflow parity).
 * Pure + framework-free → unit-tested directly; the booker UI renders the
 * resulting reminder schedule.
 */

/** Reminder timestamps before a meeting start, for the given minute offsets
 *  (e.g. [1440, 60] = one day + one hour before). Sorted, only times before start. */
export function reminderTimes(startMs: number, offsetsMin: number[]): number[] {
  return offsetsMin
    .map((m) => startMs - m * 60_000)
    .filter((t) => t < startMs)
    .sort((a, b) => a - b);
}

export interface Slot {
  startMs: number;
  durationMin: number;
}

/** True if [startMs, +duration) overlaps any existing booking. */
export function hasConflict(existing: Slot[], startMs: number, durationMin: number): boolean {
  const end = startMs + durationMin * 60_000;
  return existing.some((b) => {
    const bEnd = b.startMs + b.durationMin * 60_000;
    return startMs < bEnd && b.startMs < end;
  });
}
