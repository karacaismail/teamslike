/**
 * Scheduling & Calendar bounded context (Faz 7 — Cal.com/Calendly from scratch).
 * FastAPI-compatible: slots are computed from availability + buffers + min-notice;
 * a calendar backend syncs over webhooks. Booking links to Meeting (Faz 3).
 */

export type AssignmentMode = "solo" | "roundrobin" | "collective";
export type MeetingLocation = "aura_meet" | "phone" | "in_person";

export interface EventType {
  id: string;
  /** Workspace this event type belongs to (J5); undefined = visible everywhere. */
  workspaceId?: string;
  ownerId: string;
  slug: string;
  title: string;
  durationMin: number;
  bufferBefore: number;
  bufferAfter: number;
  minNoticeMin: number;
  location: MeetingLocation;
  assignment: AssignmentMode;
  hostIds: string[];
}

/** Weekly availability rule (minutes from local midnight). */
export interface HoursRule {
  weekday: number; // 0=Sun … 6=Sat
  startMin: number;
  endMin: number;
}

/** Date-specific override (holiday / extra hours). */
export interface DateOverride {
  date: string; // yyyy-mm-dd
  available: boolean;
  startMin?: number;
  endMin?: number;
}

export interface AvailabilitySchedule {
  id: string;
  ownerId: string;
  timezone: string;
  rules: HoursRule[];
  overrides: DateOverride[];
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "rescheduled";

export interface Booking {
  id: string;
  eventTypeId: string;
  inviteeName: string;
  inviteeEmail: string;
  startMs: number;
  endMs: number;
  status: BookingStatus;
  location: MeetingLocation;
  hostId?: string;
  meetingId?: string; // links to a Meeting (Faz 3)
}

export interface Reminder {
  id: string;
  bookingId: string;
  channel: "email" | "sms" | "push";
  offsetMin: number;
}

/** A bookable time window (generated, not persisted). */
export interface Slot {
  startMs: number;
  endMs: number;
}

/**
 * Typed domain events = the contract (`booking.*` + sidecars).
 *
 *  BookingRequested  → "booking.requested"
 *  BookingConfirmed  → "booking.confirmed"
 *  BookingCancelled  → "booking.cancelled"
 *  BookingRescheduled→ "booking.rescheduled"
 *  ReminderScheduled → "reminder.scheduled"
 *  SlotHeld          → "slot.held"
 */
export type SchedulingEvent =
  | { type: "booking.requested"; booking: Booking }
  | { type: "booking.confirmed"; bookingId: string }
  | { type: "booking.cancelled"; bookingId: string }
  | { type: "booking.rescheduled"; bookingId: string; startMs: number; endMs: number }
  | { type: "reminder.scheduled"; reminder: Reminder }
  | { type: "slot.held"; eventTypeId: string; startMs: number };

/* ───────────── Workspace reservation (Zoom Spaces parity) ───────────── */

/** A bookable physical resource: hot-desk or meeting room. */
export type DeskKind = "desk" | "room";

/** Day-slot granularity for hot-desking. `full` spans the whole day. */
export type DeskSlot = "am" | "pm" | "full";

export interface Desk {
  id: string;
  label: string; // "Desk A1" / "Focus Room 2"
  zone: string; // floor / wing, e.g. "3rd Floor · North"
  kind: DeskKind;
  capacity: number; // desk = 1; room = seats
  amenities: string[]; // "dual-monitor", "dock", "window", "whiteboard"
}

export interface Reservation {
  id: string;
  deskId: string;
  userId: string;
  dateISO: string; // yyyy-mm-dd
  slot: DeskSlot;
  checkedIn: boolean;
}
