import type {
  AdherenceRow,
  Agent,
  CannedResponse,
  Contact,
  Conversation,
  Inbox,
  KbArticle,
  Macro,
  QaEvaluation,
  ScorecardCriterion,
  Shift,
  StaffingInterval,
  StudioAgent,
} from "./types";

const MIN = 60_000;
const base = Date.now();

export const INBOXES: Inbox[] = [
  { id: "ib_chat", channelType: "livechat", name: "Website chat", connection: "connected", provider: "native" },
  { id: "ib_wa", channelType: "whatsapp", name: "WhatsApp", connection: "coexistence", provider: "cloud_api" },
  { id: "ib_mail", channelType: "email", name: "Support email", connection: "connected", provider: "native" },
  { id: "ib_tg", channelType: "telegram", name: "Telegram bot", connection: "pending", provider: "native" },
  { id: "ib_ig", channelType: "instagram", name: "Instagram DM", connection: "disconnected", provider: "bsp" },
];

export const AGENTS: Agent[] = [
  { id: "usr_1", name: "You", available: true, skills: ["billing", "tier2"] },
  { id: "usr_3", name: "Sora Kim", available: true, skills: ["tier1"] },
  { id: "usr_4", name: "Devin Roy", available: false, skills: ["billing"] },
];

export const CONTACTS: Contact[] = [
  { id: "ct_jordan", name: "Jordan Blake", identifiers: { email: "jordan@acme.com", phone: "+16285550199" }, attributes: { plan: "Pro", company: "Acme" } },
  { id: "ct_dana", name: "Dana Wu", identifiers: { email: "dana@globex.io", social: "@danawu" }, attributes: { plan: "Enterprise", company: "Globex" } },
  { id: "ct_leo", name: "Leo Pratt", identifiers: { phone: "+12025550188" }, attributes: { plan: "Free" } },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: "cv1",
    workspaceId: "ws_core",
    inboxId: "ib_chat",
    contactId: "ct_jordan",
    assigneeId: "usr_1",
    status: "open",
    priority: "high",
    slaDueAt: base + 8 * MIN,
    labels: ["billing"],
    unread: 1,
    messages: [
      { id: "m1", conversationId: "cv1", direction: "in", authorType: "contact", authorId: "ct_jordan", body: "My invoice looks wrong this month.", tMinutes: 6 },
      { id: "m2", conversationId: "cv1", direction: "out", authorType: "agent", authorId: "usr_1", body: "Let me check that for you.", tMinutes: 4 },
    ],
  },
  {
    id: "cv2",
    workspaceId: "ws_core",
    inboxId: "ib_wa",
    contactId: "ct_dana",
    status: "pending",
    priority: "urgent",
    slaDueAt: base - 3 * MIN, // breached
    labels: ["bug-report"],
    unread: 2,
    messages: [
      { id: "m3", conversationId: "cv2", direction: "in", authorType: "contact", authorId: "ct_dana", body: "The export button returns a 500 error.", tMinutes: 20 },
      { id: "m4", conversationId: "cv2", direction: "in", authorType: "contact", authorId: "ct_dana", body: "Still broken — this is urgent.", tMinutes: 12 },
    ],
  },
  {
    id: "cv3",
    workspaceId: "ws_growth",
    inboxId: "ib_mail",
    contactId: "ct_leo",
    assigneeId: "usr_3",
    status: "snoozed",
    priority: "low",
    slaDueAt: base + 120 * MIN,
    labels: [],
    unread: 0,
    messages: [
      { id: "m5", conversationId: "cv3", direction: "in", authorType: "contact", authorId: "ct_leo", body: "How do I upgrade to Pro?", tMinutes: 240 },
      { id: "m6", conversationId: "cv3", direction: "out", authorType: "agent", authorId: "usr_3", body: "Sent you the upgrade link.", tMinutes: 180 },
    ],
  },
  {
    id: "cv4",
    inboxId: "ib_chat",
    contactId: "ct_jordan",
    assigneeId: "usr_1",
    status: "resolved",
    priority: "medium",
    slaDueAt: base - 600 * MIN,
    labels: ["billing"],
    unread: 0,
    csat: 5,
    messages: [
      { id: "m7", conversationId: "cv4", direction: "in", authorType: "contact", authorId: "ct_jordan", body: "Thanks, that fixed it!", tMinutes: 600 },
    ],
  },
];

export const MACROS: Macro[] = [
  {
    id: "mac_refund",
    name: "Process refund",
    actions: [
      { type: "reply", value: "I've started your refund — it'll arrive in 5–7 business days." },
      { type: "label", value: "refund" },
      { type: "status", value: "resolved" },
    ],
  },
  {
    id: "mac_escalate",
    name: "Escalate to tier 2",
    actions: [
      { type: "priority", value: "urgent" },
      { type: "assign", value: "usr_1" },
      { type: "reply", value: "I'm escalating this to our senior team now." },
    ],
  },
];

export const CANNED: CannedResponse[] = [
  { id: "cn_hi", shortcode: "/hi", body: "Hi {{name}}, thanks for reaching out — how can I help?" },
  { id: "cn_refund", shortcode: "/refund", body: "Your refund for {{plan}} is being processed." },
  { id: "cn_hours", shortcode: "/hours", body: "Our team is available 09:00–18:00 (Europe/Istanbul)." },
];

export const KB_ARTICLES: KbArticle[] = [
  { id: "kb_billing", title: "Fixing a wrong invoice", body: "Invoices recalculate on proration. Check the billing period and applied credits." },
  { id: "kb_export", title: "Export returns 500", body: "Known issue with large exports; retry with a smaller date range while we patch." },
  { id: "kb_upgrade", title: "Upgrading your plan", body: "Go to Settings → Billing → Change plan. Annual saves 20%." },
];

/* ─────────── WFO / WEM seed ─────────── */

/** Avg handle time / interval length used by the forecast (demo constants). */
export const WFO_AHT_SEC = 240;
export const WFO_INTERVAL_SEC = 1800; // 30 min
export const WFO_OCCUPANCY = 0.85;

export const STAFFING: StaffingInterval[] = [
  { id: "i_09", label: "09:00", forecastVolume: 12, required: 2, scheduled: 3 },
  { id: "i_10", label: "10:00", forecastVolume: 25, required: 4, scheduled: 3 },
  { id: "i_11", label: "11:00", forecastVolume: 30, required: 5, scheduled: 4 },
  { id: "i_12", label: "12:00", forecastVolume: 16, required: 3, scheduled: 3 },
];

export const SHIFTS: Shift[] = [
  { id: "sh_1", agentId: "usr_1", start: "09:00", end: "17:00" },
  { id: "sh_2", agentId: "usr_3", start: "10:00", end: "18:00" },
];

export const ADHERENCE: AdherenceRow[] = [
  { agentId: "usr_1", scheduledMin: 480, adherentMin: 462 },
  { agentId: "usr_3", scheduledMin: 480, adherentMin: 408 },
  { agentId: "usr_4", scheduledMin: 240, adherentMin: 240 },
];

export const SCORECARD: ScorecardCriterion[] = [
  { id: "sc_greet", label: "Greeting & empathy", weight: 1 },
  { id: "sc_resolve", label: "Resolution quality", weight: 3 },
  { id: "sc_tone", label: "Tone & clarity", weight: 2 },
  { id: "sc_compliance", label: "Compliance", weight: 2 },
];

export const QA_EVALUATIONS: QaEvaluation[] = [
  {
    id: "qa_1",
    agentId: "usr_3",
    conversationId: "cv_1",
    scores: { sc_greet: 5, sc_resolve: 4, sc_tone: 5, sc_compliance: 4 },
  },
];

/* ─────────── AI Agent Studio seed ─────────── */

export const STUDIO_AGENTS: StudioAgent[] = [
  {
    id: "ag_support",
    name: "Support Concierge",
    goal: "Resolve common billing and account questions, and hand off anything complex to a human agent.",
    channels: ["webchat", "whatsapp"],
    status: "published",
    knowledge: [
      { id: "k_kb", label: "Help center articles", kind: "kb" },
      { id: "k_policy", label: "Refund policy", kind: "url" },
    ],
    tools: [
      { id: "t_ticket", label: "Create ticket", enabled: true },
      { id: "t_order", label: "Look up order", enabled: true },
      { id: "t_refund", label: "Issue refund", enabled: false },
    ],
    intents: [
      { id: "ai_invoice", label: "Invoice question", phrases: ["invoice", "billing", "charge"], reply: "I can pull up your latest invoice — could you confirm the billing email?" },
      { id: "ai_refund", label: "Refund", phrases: ["refund", "money back", "cancel charge"], reply: "Refunds process in 5–7 days. I've logged your request." },
      { id: "ai_reset", label: "Password reset", phrases: ["password", "reset", "locked out"], reply: "I've sent a reset link to your email." },
    ],
    metrics: { runs: 420, resolved: 318 },
  },
  {
    id: "ag_sales",
    name: "Sales Assistant",
    goal: "Qualify inbound leads and book a demo with the right rep.",
    channels: ["webchat"],
    status: "draft",
    knowledge: [{ id: "k_pricing", label: "Pricing page", kind: "url" }],
    tools: [{ id: "t_book", label: "Book meeting", enabled: true }],
    intents: [
      { id: "ai_pricing", label: "Pricing", phrases: ["pricing", "cost", "how much"], reply: "Plans start at our Starter tier — want me to book a quick demo?" },
    ],
    metrics: { runs: 96, resolved: 51 },
  },
];
