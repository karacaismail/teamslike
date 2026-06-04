import { create } from "zustand";
import { BOOKINGS, EVENT_TYPES, SCHEDULES } from "./data";
import { pickRoundRobin, rescheduleBooking } from "./slots";
import type { AvailabilitySchedule, Booking, EventType, SchedulingEvent } from "./types";

let seq = 0;
const bid = () => `bk_${Date.now()}_${seq++}`;
const cloneBookings = (): Booking[] => BOOKINGS.map((b) => ({ ...b }));
// Default to a core-workspace event type regardless of seed order (J5).
const DEFAULT_ET = (EVENT_TYPES.find((e) => e.workspaceId == null || e.workspaceId === "ws_core") ?? EVENT_TYPES[0]).id;

interface SchedState {
  eventTypes: EventType[];
  schedules: AvailabilitySchedule[];
  bookings: Booking[];
  activeEventTypeId: string;
  rrIndex: number;

  setActiveEventType: (id: string) => void;
  book: (eventTypeId: string, name: string, email: string, startMs: number) => void;
  cancel: (bookingId: string) => void;
  reschedule: (bookingId: string, newStartMs: number) => void;
  applyEvent: (evt: SchedulingEvent) => void;
  reset: () => void;
}

export const useSchedulingStore = create<SchedState>((set, get) => ({
  eventTypes: EVENT_TYPES,
  schedules: SCHEDULES,
  bookings: cloneBookings(),
  activeEventTypeId: DEFAULT_ET,
  rrIndex: -1,

  setActiveEventType: (id) => set({ activeEventTypeId: id }),

  book: (eventTypeId, name, email, startMs) => {
    const s = get();
    const et = s.eventTypes.find((e) => e.id === eventTypeId);
    if (!et) return;
    let hostId = et.hostIds[0];
    let rrIndex = s.rrIndex;
    if (et.assignment === "roundrobin") {
      hostId = pickRoundRobin(et.hostIds, s.rrIndex);
      rrIndex = et.hostIds.indexOf(hostId);
    }
    const booking: Booking = {
      id: bid(),
      eventTypeId,
      inviteeName: name,
      inviteeEmail: email,
      startMs,
      endMs: startMs + et.durationMin * 60_000,
      status: "confirmed",
      location: et.location,
      hostId,
    };
    set({ bookings: [...s.bookings, booking], rrIndex });
  },

  cancel: (bookingId) =>
    set((s) => ({ bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b)) })),

  reschedule: (bookingId, newStartMs) =>
    set((s) => ({
      bookings: s.bookings.map((b) => {
        if (b.id !== bookingId) return b;
        const et = s.eventTypes.find((e) => e.id === b.eventTypeId);
        return rescheduleBooking(b, newStartMs, et?.durationMin ?? 30);
      }),
    })),

  applyEvent: (evt) =>
    set((s) => {
      switch (evt.type) {
        case "booking.requested":
          return s.bookings.some((b) => b.id === evt.booking.id) ? {} : { bookings: [...s.bookings, evt.booking] };
        case "booking.confirmed":
          return { bookings: s.bookings.map((b) => (b.id === evt.bookingId ? { ...b, status: "confirmed" } : b)) };
        case "booking.cancelled":
          return { bookings: s.bookings.map((b) => (b.id === evt.bookingId ? { ...b, status: "cancelled" } : b)) };
        case "booking.rescheduled":
          return {
            bookings: s.bookings.map((b) =>
              b.id === evt.bookingId ? { ...b, startMs: evt.startMs, endMs: evt.endMs, status: "rescheduled" } : b,
            ),
          };
        default:
          return {};
      }
    }),

  reset: () => set({ bookings: cloneBookings(), activeEventTypeId: DEFAULT_ET, rrIndex: -1 }),
}));
