import type { AgendaItem, AppEvent, EventBadge, EventCta, Panelist, Poll, QnaItem, Registration, TicketTier } from "./types";

const base = Date.now();

/** Primary demo event. `eventStore.mode` overrides the runtime mode (live/simulive/evergreen). */
export const EVENTS: AppEvent[] = [
  {
    id: "ev_launch",
    title: "AURA Product Launch 2030",
    type: "live",
    startsAt: base - 45_000, // started 45s ago (live demo)
    durationSec: 1800,
    capacity: 100_000,
    branding: { accent: "#6d28d9" },
    registrationFields: [
      { id: "name", label: "Full name", required: true, type: "text" },
      { id: "email", label: "Work email", required: true, type: "email" },
      { id: "company", label: "Company", required: false, type: "text" },
      { id: "role", label: "Role", required: true, type: "select", options: ["Engineer", "Manager", "Executive", "Other"] },
    ],
    sessions: [
      { id: "s_keynote", eventId: "ev_launch", title: "Keynote", startsAt: base - 45_000 },
      { id: "s_demo", eventId: "ev_launch", title: "Live demo", startsAt: base + 600_000 },
      { id: "s_qa", eventId: "ev_launch", title: "Q&A", startsAt: base + 1_200_000 },
    ],
  },
  {
    id: "ev_townhall",
    title: "Company Town Hall — Q3",
    type: "townhall",
    startsAt: base + 86_400_000, // tomorrow
    durationSec: 3600,
    capacity: 3000, // interactive
    viewOnlyCapacity: 10_000, // view-only overflow tier
    requireApproval: true, // host approves registrations
    branding: { accent: "#0ea5e9" },
    registrationFields: [
      { id: "name", label: "Full name", required: true, type: "text" },
      { id: "email", label: "Work email", required: true, type: "email" },
      { id: "team", label: "Team", required: true, type: "select", options: ["Engineering", "Sales", "Ops", "Finance"] },
    ],
    sessions: [{ id: "s_th", eventId: "ev_townhall", title: "All-hands", startsAt: base + 86_400_000 }],
  },
];

export const REGISTRATIONS: Registration[] = [
  { id: "rg1", eventId: "ev_launch", values: { name: "Jordan Blake", email: "jordan@acme.com", role: "Manager" }, status: "attended", utm: { source: "linkedin" } },
  { id: "rg2", eventId: "ev_launch", values: { name: "Dana Wu", email: "dana@globex.io", role: "Executive" }, status: "attended", utm: { source: "email" } },
  { id: "rg3", eventId: "ev_launch", values: { name: "Mara Ito", email: "mara@initech.com", role: "Engineer" }, status: "attended", utm: { source: "x" } },
  { id: "rg4", eventId: "ev_launch", values: { name: "Leo Pratt", email: "leo@umbrella.co", role: "Other" }, status: "no_show", utm: { source: "linkedin" } },
  { id: "rg5", eventId: "ev_launch", values: { name: "Sora Kim", email: "sora@hooli.com", role: "Manager" }, status: "registered", utm: { source: "email" } },
  // Town hall — approval + waitlist lifecycle
  { id: "th1", eventId: "ev_townhall", values: { name: "Aylin Demir", email: "aylin@aura.dev", team: "Engineering" }, status: "registered", approval: "approved" },
  { id: "th2", eventId: "ev_townhall", values: { name: "Marco Rossi", email: "marco@aura.dev", team: "Sales" }, status: "registered", approval: "approved" },
  { id: "th3", eventId: "ev_townhall", values: { name: "Devin Roy", email: "devin@aura.dev", team: "Ops" }, status: "registered", approval: "pending" },
  { id: "th4", eventId: "ev_townhall", values: { name: "Lena Park", email: "lena@aura.dev", team: "Finance" }, status: "registered", approval: "pending" },
  { id: "th5", eventId: "ev_townhall", values: { name: "Omar Aziz", email: "omar@aura.dev", team: "Engineering" }, status: "registered", approval: "waitlisted" },
];

export const PANELISTS: Panelist[] = [
  { id: "usr_1", eventId: "ev_launch", name: "You", role: "host" },
  { id: "usr_2", eventId: "ev_launch", name: "Aylin Demir", role: "panelist" },
  { id: "usr_3", eventId: "ev_launch", name: "Sora Kim", role: "panelist" },
  { id: "usr_4", eventId: "ev_launch", name: "Devin Roy", role: "moderator" },
];

export const POLLS: Poll[] = [
  {
    id: "pl_priority",
    eventId: "ev_launch",
    question: "What should we ship next?",
    state: "live",
    options: [
      { id: "o1", text: "Mobile app", votes: ["a1", "a2", "a7"] },
      { id: "o2", text: "Public API", votes: ["a3", "a4", "a5", "a6"] },
      { id: "o3", text: "Offline mode", votes: ["a8"] },
    ],
  },
  {
    id: "pl_rating",
    eventId: "ev_launch",
    question: "How likely are you to recommend AURA?",
    state: "draft",
    options: [
      { id: "o1", text: "Very likely", votes: [] },
      { id: "o2", text: "Maybe", votes: [] },
      { id: "o3", text: "Unlikely", votes: [] },
    ],
  },
];

export const QNA: QnaItem[] = [
  { id: "q1", eventId: "ev_launch", authorId: "a1", text: "Will there be a self-hosted option?", upvotes: ["a2", "a3", "a4"], answered: false, tSec: 120 },
  { id: "q2", eventId: "ev_launch", authorId: "a5", text: "What's the pricing for enterprise?", upvotes: ["a6"], answered: false, tSec: 240 },
  { id: "q3", eventId: "ev_launch", authorId: "a7", text: "Is the API rate-limited?", upvotes: ["a1", "a2", "a8", "a9", "a10"], answered: true, tSec: 60 },
];

export const CTAS: EventCta[] = [
  { id: "cta_trial", label: "Start free trial", url: "https://aura.dev/trial" },
  { id: "cta_deck", label: "Download the deck", url: "https://aura.dev/launch-deck" },
];

/** Baseline concurrent attendees (simulated). */
export const ATTENDEE_BASE = 8421;

/* ─────────── Events management seed (tickets / agenda / badges) ─────────── */

export const TICKET_TIERS: TicketTier[] = [
  { id: "tt_free", name: "General (online)", currency: "USD", price: 0, quantity: 5000, sold: 3120 },
  { id: "tt_pro", name: "Pro pass", currency: "USD", price: 149, quantity: 800, sold: 612 },
  { id: "tt_vip", name: "VIP + workshop", currency: "EUR", price: 399, quantity: 120, sold: 120 },
  { id: "tt_local", name: "Yerel (İstanbul)", currency: "TRY", price: 2500, quantity: 300, sold: 88 },
];

export const AGENDA: AgendaItem[] = [
  { id: "ag_1", day: "Day 1", track: "Main stage", start: "09:00", end: "09:45", title: "Opening keynote", speaker: "İsmail Karaca" },
  { id: "ag_2", day: "Day 1", track: "Main stage", start: "10:00", end: "10:45", title: "Platform roadmap", speaker: "Defne Yıldız" },
  { id: "ag_3", day: "Day 1", track: "Workshop room", start: "10:00", end: "11:30", title: "Hands-on: building agents", speaker: "Marco Rossi" },
  { id: "ag_4", day: "Day 2", track: "Main stage", start: "09:30", end: "10:15", title: "Customer panel", speaker: "Panel" },
];

export const EVENT_BADGE: EventBadge = {
  fields: ["name", "company", "role"],
  accent: "#6d28d9",
};
