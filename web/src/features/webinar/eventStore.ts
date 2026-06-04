import { create } from "zustand";
import { ATTENDEE_BASE, EVENTS, REGISTRATIONS } from "./data";
import { admitFromWaitlist, nextApproval } from "./webinar";
import type { AppEvent, EventType, Registration } from "./types";

let seq = 0;
const newId = () => `rg_${Date.now()}_${seq++}`;

interface EventState {
  events: AppEvent[];
  activeEventId: string;
  /** Runtime mode override (live / simulive / evergreen / ondemand). */
  mode: EventType;
  /** console = host management, live = attendee experience. */
  phase: "console" | "live";
  registrations: Registration[];
  attendees: number;

  setEvent: (id: string) => void;
  setMode: (mode: EventType) => void;
  goLive: () => void;
  exitLive: () => void;
  register: (values: Record<string, string>) => void;
  /** Approve a pending registration (town-hall manual approval). */
  approveRegistration: (id: string) => void;
  /** Reject a pending registration. */
  rejectRegistration: (id: string) => void;
  /** Promote the oldest waitlisted registration to approved (FIFO). */
  admitNext: () => void;
  reset: () => void;
}

const DEFAULT = EVENTS[0];

export const useEventStore = create<EventState>((set) => ({
  events: EVENTS,
  activeEventId: DEFAULT.id,
  mode: DEFAULT.type,
  phase: "console",
  registrations: [...REGISTRATIONS],
  attendees: ATTENDEE_BASE,

  setEvent: (id) => set({ activeEventId: id, mode: EVENTS.find((e) => e.id === id)?.type ?? "live" }),
  setMode: (mode) => set({ mode }),
  goLive: () => set({ phase: "live" }),
  exitLive: () => set({ phase: "console" }),
  register: (values) =>
    set((s) => {
      const event = s.events.find((e) => e.id === s.activeEventId);
      const approval = event ? nextApproval(event, s.registrations) : "approved";
      return {
        registrations: [...s.registrations, { id: newId(), eventId: s.activeEventId, values, status: "registered", approval }],
      };
    }),

  approveRegistration: (id) =>
    set((s) => ({ registrations: s.registrations.map((r) => (r.id === id ? { ...r, approval: "approved" } : r)) })),
  rejectRegistration: (id) =>
    set((s) => ({ registrations: s.registrations.map((r) => (r.id === id ? { ...r, approval: "rejected" } : r)) })),
  admitNext: () =>
    set((s) => {
      const forEvent = s.registrations.filter((r) => r.eventId === s.activeEventId);
      const next = admitFromWaitlist(forEvent);
      if (!next) return {};
      return { registrations: s.registrations.map((r) => (r.id === next.id ? { ...r, approval: "approved" } : r)) };
    }),

  reset: () =>
    set({
      activeEventId: DEFAULT.id,
      mode: DEFAULT.type,
      phase: "console",
      registrations: [...REGISTRATIONS],
      attendees: ATTENDEE_BASE,
    }),
}));
