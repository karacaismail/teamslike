import type {
  BusinessHours,
  Call,
  CallQueue,
  Contact,
  HuntGroup,
  IVRMenu,
  PhoneLine,
  ReceptionistConfig,
  RoutingRule,
  SmsThread,
  SmsTemplate,
  Voicemail,
  VoicemailGreeting,
} from "./types";

const MIN = 60_000;
const base = Date.now();

/** Workspace phone line + extensions. */
export const LINES: PhoneLine[] = [
  {
    id: "ln_main",
    e164: "+14155551000",
    label: "AURA — Main line",
    extensions: [
      { id: "x101", number: "101", label: "Sales" },
      { id: "x102", number: "102", label: "Support" },
      { id: "x103", number: "103", label: "Billing" },
    ],
    delegates: [
      { id: "usr_5", name: "Mara Ito", canAnswer: true, canPlaceOnBehalf: true },
      { id: "usr_3", name: "Sora Kim", canAnswer: true, canPlaceOnBehalf: false },
    ],
  },
];

/** Address book for caller-ID resolution. */
export const CONTACTS: Contact[] = [
  { id: "ct_jordan", name: "Jordan Blake", e164: "+16285550199" },
  { id: "ct_acme", name: "Acme Procurement", e164: "+14155550142" },
  { id: "ct_dana", name: "Dana Wu", e164: "+12025550188" },
];

/**
 * Find-me/follow-me rules, most-specific first. `always` is the catch-all and
 * must stay last so conditional rules win.
 */
export const ROUTING_RULES: RoutingRule[] = [
  { id: "rr_ah", lineId: "ln_main", condition: "afterHours", action: "voicemail" },
  { id: "rr_busy", lineId: "ln_main", condition: "busy", action: "forward", target: "+16285550199" },
  { id: "rr_na", lineId: "ln_main", condition: "noAnswer", action: "voicemail" },
  { id: "rr_all", lineId: "ln_main", condition: "always", action: "ivr", target: "ivr_main" },
];

/** Recent call log (already ended). */
export const CALL_HISTORY: Call[] = [
  {
    id: "cl1",
    lineId: "ln_main",
    direction: "inbound",
    from: "+16285550199",
    to: "+14155551000",
    state: "ended",
    startedAt: base - 42 * MIN,
    durationSec: 214,
    endReason: "completed",
    recordingId: "rec_cl1",
  },
  {
    id: "cl2",
    lineId: "ln_main",
    direction: "outbound",
    from: "+14155551000",
    to: "+14155550142",
    state: "ended",
    startedAt: base - 95 * MIN,
    durationSec: 0,
    endReason: "missed",
  },
  {
    id: "cl3",
    lineId: "ln_main",
    direction: "inbound",
    from: "+12025550188",
    to: "+14155551000",
    state: "ended",
    startedAt: base - 180 * MIN,
    durationSec: 0,
    endReason: "voicemail",
  },
  {
    id: "cl4",
    lineId: "ln_main",
    direction: "outbound",
    from: "+14155551000",
    to: "+16285550199",
    state: "ended",
    startedAt: base - 1440 * MIN,
    durationSec: 488,
    endReason: "completed",
  },
];

export const VOICEMAILS: Voicemail[] = [
  {
    id: "vm1",
    lineId: "ln_main",
    from: "+12025550188",
    receivedAt: base - 180 * MIN,
    durationSec: 23,
    transcript: "Hi, it's Dana — following up on the renewal quote. Call me back when you can.",
    heard: false,
  },
  {
    id: "vm2",
    lineId: "ln_main",
    from: "+14155550142",
    receivedAt: base - 26 * 60 * MIN,
    durationSec: 41,
    transcript: "This is Acme procurement. We approved the order; please send the final invoice.",
    heard: true,
  },
];

export const SMS_THREADS: SmsThread[] = [
  {
    id: "sm_jordan",
    contact: "Jordan Blake",
    e164: "+16285550199",
    unread: 1,
    messages: [
      { id: "m1", threadId: "sm_jordan", from: "+16285550199", to: "+14155551000", body: "Are we still on for the 3pm demo?", sentAt: base - 12 * MIN, outbound: false },
      { id: "m2", threadId: "sm_jordan", from: "+14155551000", to: "+16285550199", body: "Yes — sending the link now.", sentAt: base - 10 * MIN, outbound: true },
      { id: "m3", threadId: "sm_jordan", from: "+16285550199", to: "+14155551000", body: "Here's the signed form.", sentAt: base - 2 * MIN, outbound: false, media: [{ kind: "file", name: "order-form.pdf" }] },
    ],
  },
  {
    id: "sm_launch",
    contact: "Launch group",
    e164: "+14155550142",
    unread: 0,
    participants: ["+16285550199", "+14155550142", "+12025550188"],
    messages: [
      { id: "g1", threadId: "sm_launch", from: "+12025550188", to: "+14155551000", body: "Are we go for Thursday?", sentAt: base - 30 * MIN, outbound: false },
      { id: "g2", threadId: "sm_launch", from: "+14155551000", to: "+14155550142", body: "Yes — assets attached.", sentAt: base - 28 * MIN, outbound: true, media: [{ kind: "image", name: "banner.png" }] },
    ],
  },
];

/** Canned SMS replies (templates / automation). */
export const SMS_CANNED: string[] = [
  "Thanks for reaching out — how can we help?",
  "I'll get back to you shortly.",
  "Here's the link to book a time: cal.aura.dev/demo",
];

/** Variable templates ({{name}}, {{date}} …) for SMS automation. */
export const SMS_TEMPLATES: SmsTemplate[] = [
  { id: "tpl_confirm", name: "Demo confirmation", body: "Hi {{name}}, confirming your demo on {{date}}. Reply STOP to cancel." },
  { id: "tpl_quote", name: "Quote follow-up", body: "Hi {{name}}, your quote {{quote}} is ready: cal.aura.dev/q/{{quote}}" },
];

/** Selectable voicemail greetings. */
export const GREETINGS: VoicemailGreeting[] = [
  { id: "g_default", name: "Default" },
  { id: "g_afterhours", name: "After hours" },
  { id: "g_holiday", name: "Holiday" },
];

/* ───────────────────────── PBX core (P0) ───────────────────────── */

/** Call queues (ring groups) with seeded agents + a couple of waiting callers. */
export const QUEUES: CallQueue[] = [
  {
    id: "q_sales",
    name: "Sales",
    lineId: "ln_main",
    strategy: "round_robin",
    maxWaitSec: 120,
    overflowAction: "voicemail",
    agents: [
      { id: "usr_1", name: "You", idleSec: 40, available: true, skills: ["demo", "pricing"] },
      { id: "usr_5", name: "Mara Ito", idleSec: 12, available: true, skills: ["demo"] },
      { id: "usr_6", name: "Leo Pratt", idleSec: 95, available: false, skills: ["pricing", "enterprise"] },
    ],
    waiting: [
      { id: "qc1", from: "+14155550142", since: base - 40_000 },
      { id: "qc2", from: "+12025550188", since: base - 15_000 },
    ],
  },
  {
    id: "q_support",
    name: "Support",
    lineId: "ln_main",
    strategy: "longest_idle",
    maxWaitSec: 180,
    overflowAction: "forward",
    overflowTarget: "+16285550199",
    agents: [
      { id: "usr_3", name: "Sora Kim", idleSec: 210, available: true, skills: ["billing", "tier2"] },
      { id: "usr_4", name: "Devin Roy", idleSec: 60, available: true, skills: ["tier1"] },
    ],
    waiting: [],
  },
];

/** Hunt groups — ring a fixed set of users (no ACD hold/analytics). */
export const HUNT_GROUPS: HuntGroup[] = [
  {
    id: "hg_frontdesk",
    name: "Front desk",
    ring: "all",
    members: [
      { id: "usr_1", name: "You", available: true },
      { id: "usr_5", name: "Mara Ito", available: true },
    ],
  },
  {
    id: "hg_onsite",
    name: "On-site techs",
    ring: "sequential",
    members: [
      { id: "usr_4", name: "Devin Roy", available: false },
      { id: "usr_3", name: "Sora Kim", available: true },
      { id: "usr_6", name: "Leo Pratt", available: true },
    ],
  },
];

/** Multi-level IVR (auto-attendant) menus. `menu` options point to another menu. */
export const IVR_MENUS: IVRMenu[] = [
  {
    id: "ivr_main",
    name: "Main attendant",
    greeting: "Thanks for calling AURA. For Sales press 1, Support press 2, Billing press 3.",
    options: [
      { key: "1", label: "Sales", action: "queue", target: "q_sales" },
      { key: "2", label: "Support", action: "menu", target: "ivr_support" },
      { key: "3", label: "Billing", action: "extension", target: "103" },
      { key: "0", label: "Operator", action: "forward", target: "+16285550199" },
    ],
  },
  {
    id: "ivr_support",
    name: "Support submenu",
    greeting: "For existing tickets press 1, new issues press 2, voicemail press 9.",
    options: [
      { key: "1", label: "Existing ticket", action: "queue", target: "q_support" },
      { key: "2", label: "New issue", action: "queue", target: "q_support" },
      { key: "9", label: "Leave a message", action: "voicemail" },
    ],
  },
];

/** Business-hours schedule (Mon–Fri 09:00–18:00) + a holiday. */
export const SCHEDULE: BusinessHours = {
  id: "sch_main",
  name: "Default hours",
  timezone: "Europe/Istanbul",
  weekly: [1, 2, 3, 4, 5].map((day) => ({ day, openMin: 9 * 60, closeMin: 18 * 60 })),
  holidays: ["2026-01-01"],
};

export const RECEPTIONIST: ReceptionistConfig = {
  id: "recep_main",
  enabled: true,
  greeting: "Thanks for calling Aura — I'm the virtual receptionist. How can I help?",
  afterHoursGreeting: "Aura is closed right now. Tell me what you need and we'll follow up.",
  hoursId: "sch_main",
  captureFields: ["name", "phone", "reason"],
  fallback: "human",
  smsFollowUp: true,
  intents: [
    {
      id: "int_sales",
      label: "Sales",
      phrases: ["pricing", "buy", "plan", "quote", "demo"],
      action: "route_queue",
      target: "q_sales",
    },
    {
      id: "int_support",
      label: "Support",
      phrases: ["help", "broken", "issue", "not working", "support"],
      action: "route_queue",
      target: "q_support",
    },
    {
      id: "int_hours",
      label: "Opening hours",
      phrases: ["hours", "open", "when are you open"],
      action: "answer_faq",
      answer: "We're open weekdays 9:00–18:00 (Europe/Istanbul).",
    },
    {
      id: "int_booking",
      label: "Book a meeting",
      phrases: ["appointment", "book", "schedule", "meeting"],
      action: "book",
    },
    {
      id: "int_billing",
      label: "Billing",
      phrases: ["invoice", "billing", "refund", "payment"],
      action: "route_extension",
      target: "210",
    },
  ],
};
