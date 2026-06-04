import type { AvailabilitySchedule, Booking, Desk, EventType, Reservation } from "./types";

const base = Date.now();

/** Today as yyyy-mm-dd (local) — seed reservations land on the visible default day. */
const todayISO = new Date().toISOString().slice(0, 10);

/* ───────────── Workspace reservation (Zoom Spaces parity) seeds ───────────── */

export const DESKS: Desk[] = [
  { id: "dsk_a1", label: "Desk A1", zone: "3rd Floor · North", kind: "desk", capacity: 1, amenities: ["dual-monitor", "dock", "window"] },
  { id: "dsk_a2", label: "Desk A2", zone: "3rd Floor · North", kind: "desk", capacity: 1, amenities: ["dock"] },
  { id: "dsk_b1", label: "Desk B1", zone: "3rd Floor · South", kind: "desk", capacity: 1, amenities: ["dual-monitor", "standing"] },
  { id: "dsk_b2", label: "Desk B2", zone: "3rd Floor · South", kind: "desk", capacity: 1, amenities: [] },
  { id: "room_focus", label: "Focus Room", zone: "3rd Floor · North", kind: "room", capacity: 4, amenities: ["whiteboard", "display"] },
  { id: "room_board", label: "Boardroom", zone: "5th Floor", kind: "room", capacity: 12, amenities: ["whiteboard", "display", "video"] },
];

export const RESERVATIONS: Reservation[] = [
  { id: "rsv1", deskId: "dsk_a1", userId: "usr_2", dateISO: todayISO, slot: "full", checkedIn: true },
  { id: "rsv2", deskId: "dsk_b1", userId: "usr_3", dateISO: todayISO, slot: "am", checkedIn: false },
  { id: "rsv3", deskId: "room_board", userId: "usr_2", dateISO: todayISO, slot: "pm", checkedIn: false },
];

export const EVENT_TYPES: EventType[] = [
  {
    id: "et_growth",
    workspaceId: "ws_growth",
    ownerId: "usr_2",
    slug: "growth-sync",
    title: "Growth sync",
    durationMin: 20,
    bufferBefore: 0,
    bufferAfter: 5,
    minNoticeMin: 30,
    location: "aura_meet",
    assignment: "solo",
    hostIds: ["usr_2"],
  },
  {
    id: "et_intro",
    workspaceId: "ws_core",
    ownerId: "usr_1",
    slug: "intro-call",
    title: "Intro call",
    durationMin: 30,
    bufferBefore: 0,
    bufferAfter: 10,
    minNoticeMin: 60,
    location: "aura_meet",
    assignment: "solo",
    hostIds: ["usr_1"],
  },
  {
    id: "et_strategy",
    workspaceId: "ws_core",
    ownerId: "usr_1",
    slug: "strategy-session",
    title: "Strategy session",
    durationMin: 60,
    bufferBefore: 10,
    bufferAfter: 10,
    minNoticeMin: 240,
    location: "aura_meet",
    assignment: "roundrobin",
    hostIds: ["usr_1", "usr_2"],
  },
];

/** Mon–Fri 09:00–17:00 (minutes from midnight: 540–1020). */
export const SCHEDULES: AvailabilitySchedule[] = [
  {
    id: "av_default",
    ownerId: "usr_1",
    timezone: "Europe/Istanbul",
    rules: [1, 2, 3, 4, 5].map((weekday) => ({ weekday, startMin: 540, endMin: 1020 })),
    overrides: [{ date: "2026-01-01", available: false }],
  },
];

export const BOOKINGS: Booking[] = [
  {
    id: "bk1",
    eventTypeId: "et_intro",
    inviteeName: "Jordan Blake",
    inviteeEmail: "jordan@acme.com",
    startMs: base + 26 * 60 * 60 * 1000, // ~tomorrow
    endMs: base + 26 * 60 * 60 * 1000 + 30 * 60000,
    status: "confirmed",
    location: "aura_meet",
    hostId: "usr_1",
  },
];

export const HOST_NAMES: Record<string, string> = {
  usr_1: "You",
  usr_2: "Aylin Demir",
};
