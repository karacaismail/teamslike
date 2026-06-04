import { EVENT_TYPES, SCHEDULES } from "./data";
import { generateSlots } from "./slots";
import type { AvailabilitySchedule, Booking, EventType, Slot } from "./types";

/**
 * Mocks of the FastAPI scheduling contract. Slots are computed client-side from
 * availability; the real backend computes them server-side and syncs external
 * calendars via webhook. Swapping for an httpClient leaves the UI unchanged.
 */
const delay = <T>(value: T, ms = 120): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/** GET /event-types */
export function fetchEventTypes(): Promise<EventType[]> {
  return delay(EVENT_TYPES);
}

/** GET /availability */
export function fetchAvailability(): Promise<AvailabilitySchedule[]> {
  return delay(SCHEDULES);
}

/** GET /slots?eventTypeId&date */
export function fetchSlots(eventTypeId: string, dateISO: string): Promise<Slot[]> {
  const et = EVENT_TYPES.find((e) => e.id === eventTypeId);
  return delay(et ? generateSlots(SCHEDULES[0], et, dateISO) : []);
}

/** POST /bookings */
export function createBooking(eventTypeId: string, name: string, email: string, startMs: number): Promise<Booking> {
  const et = EVENT_TYPES.find((e) => e.id === eventTypeId);
  return delay({
    id: `bk_${Date.now()}`,
    eventTypeId,
    inviteeName: name,
    inviteeEmail: email,
    startMs,
    endMs: startMs + (et?.durationMin ?? 30) * 60_000,
    status: "confirmed",
    location: et?.location ?? "aura_meet",
    hostId: et?.hostIds[0],
  });
}

/** PATCH /bookings/:id */
export function patchBooking(id: string, status: Booking["status"]): Promise<{ id: string; status: Booking["status"] }> {
  return delay({ id, status });
}
