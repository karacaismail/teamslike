/**
 * Webinar & Events bounded context (Faz 6).
 * Large-scale broadcast (live / simulive / evergreen / on-demand). Consumes
 * Translation + Conversation Intelligence (captions, intent) and Scheduling.
 * Carrier/CDN-agnostic: a broadcast backend streams `event.*` over WS; the UI
 * consumes the contract shapes below and only swaps the transport.
 */

export type EventType = "live" | "simulive" | "evergreen" | "ondemand" | "townhall";

export type RegFieldType = "text" | "email" | "select";

export interface RegField {
  id: string;
  label: string;
  required: boolean;
  type: RegFieldType;
  options?: string[];
}

export interface EventBranding {
  accent: string; // hex; overrides tenant accent in attendee mode
}

export interface Session {
  id: string;
  eventId: string;
  title: string;
  startsAt: number; // epoch ms
}

export interface AppEvent {
  id: string;
  title: string;
  type: EventType;
  startsAt: number; // epoch ms
  durationSec: number;
  capacity: number; // interactive seats
  /** Town-hall view-only overflow tier (beyond interactive capacity). */
  viewOnlyCapacity?: number;
  /** Require host approval before a registration is confirmed. */
  requireApproval?: boolean;
  branding: EventBranding;
  registrationFields: RegField[];
  sessions: Session[];
}

export type RegistrationStatus = "registered" | "attended" | "no_show";

/** Approval/waitlist lifecycle (Teams manual-approval + capacity waitlist). */
export type RegApproval = "approved" | "pending" | "rejected" | "waitlisted";

export interface Registration {
  id: string;
  eventId: string;
  values: Record<string, string>;
  status: RegistrationStatus;
  /** Defaults to "approved" when the event needs no approval and has room. */
  approval?: RegApproval;
  utm?: Record<string, string>;
}

export type PanelistRole = "host" | "panelist" | "moderator";

export interface Panelist {
  id: string;
  eventId: string;
  name: string;
  role: PanelistRole;
}

export type PollState = "draft" | "live" | "closed";

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // voter ids
}

export interface Poll {
  id: string;
  eventId: string;
  question: string;
  options: PollOption[];
  state: PollState;
}

export interface QnaItem {
  id: string;
  eventId: string;
  authorId: string;
  text: string;
  upvotes: string[];
  answered: boolean;
  tSec: number; // seconds into the event
}

/** Call-to-action shown to attendees (handout / signup); clicks feed intent (Faz 4). */
export interface EventCta {
  id: string;
  label: string;
  url: string;
}

/**
 * Typed domain events = the WS contract (`event.*`). A mock dispatcher replays
 * these; an `EventSource`/WebSocket swaps in transparently.
 *
 *  EventScheduled      → "event.scheduled"
 *  RegistrationCreated → "registration.created"
 *  AttendeeJoined      → "attendee.joined"
 *  PollLaunched        → "poll.launched"
 *  QnaUpvoted          → "qna.upvoted"
 *  SimuliveStarted     → "simulive.started"
 */
export type WebinarEvent =
  | { type: "event.scheduled"; eventId: string }
  | { type: "registration.created"; registration: Registration }
  | { type: "attendee.joined"; eventId: string; attendeeId: string }
  | { type: "poll.launched"; poll: Poll }
  | { type: "qna.upvoted"; qnaId: string; voterId: string }
  | { type: "simulive.started"; eventId: string; at: number };

/* ─────────── Events management (ticketing / agenda / badges) ────────────
 * Multi-day event production: paid ticket tiers (multi-currency), an agenda
 * with tracks, and on-site badge printing. Parity: Webex Events (Socio) /
 * Zoom Events ticketing.
 */

export interface TicketTier {
  id: string;
  name: string;
  currency: string; // ISO 4217: "USD" | "EUR" | "TRY" …
  price: number; // 0 = free tier
  quantity: number; // total available
  sold: number;
}

export interface AgendaItem {
  id: string;
  day: string; // grouping label, e.g. "Day 1"
  track: string; // parallel-track name, e.g. "Main stage"
  start: string; // "09:00"
  end: string; // "09:45"
  title: string;
  speaker?: string;
}

/** On-site badge layout: which registration fields print, + accent color. */
export interface EventBadge {
  fields: string[]; // registration field ids to print (e.g. "name","company")
  accent: string; // hex
}
