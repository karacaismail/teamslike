import type { Desk, Reservation, DeskSlot } from "./types";

/**
 * Workspace-reservation (Zoom Spaces parity) domain helpers.
 * Hot-desking / room booking at day granularity with AM/PM/full-day slots.
 * Framework-free → unit-testable; a FastAPI backend would compute the same.
 */

/** Whether two day-slots collide on the same desk+date. `full` overlaps both halves. */
export function slotsOverlap(a: DeskSlot, b: DeskSlot): boolean {
  if (a === "full" || b === "full") return true;
  return a === b;
}

/** Is a desk free for `dateISO`+`slot` given existing reservations? */
export function isDeskFree(
  reservations: Reservation[],
  deskId: string,
  dateISO: string,
  slot: DeskSlot,
): boolean {
  return !reservations.some(
    (r) => r.deskId === deskId && r.dateISO === dateISO && slotsOverlap(r.slot, slot),
  );
}

export interface DeskAvailability extends Desk {
  free: boolean;
  /** Reservation occupying the requested slot, when not free. */
  takenBy?: Reservation;
}

/** Annotate every desk with availability for the requested date+slot. */
export function deskAvailability(
  desks: Desk[],
  reservations: Reservation[],
  dateISO: string,
  slot: DeskSlot,
): DeskAvailability[] {
  return desks.map((d) => {
    const takenBy = reservations.find(
      (r) => r.deskId === d.id && r.dateISO === dateISO && slotsOverlap(r.slot, slot),
    );
    return { ...d, free: !takenBy, takenBy };
  });
}

/** Half-slot weight of a reservation (full day = 2 half-slots). */
function slotWeight(slot: DeskSlot): number {
  return slot === "full" ? 2 : 1;
}

/**
 * Occupancy for a date = reserved half-slots / total half-slots (desks × 2).
 * Clamped to [0,1]; an empty desk pool reports 0.
 */
export function occupancyRate(desks: Desk[], reservations: Reservation[], dateISO: string): number {
  const total = desks.length * 2;
  if (total === 0) return 0;
  const reserved = reservations
    .filter((r) => r.dateISO === dateISO)
    .reduce((sum, r) => sum + slotWeight(r.slot), 0);
  return Math.min(1, reserved / total);
}
