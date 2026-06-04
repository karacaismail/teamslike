/**
 * Telephony / UCaaS bounded context (Faz 5).
 * Carrier-agnostic: a SIP/VoIP backend streams `call.*` over WS and exposes
 * REST for lines/voicemails/sms; the UI consumes the contract shapes below and
 * only swaps the transport (mock → httpClient/WebSocket).
 *
 * Consumes Conversation Intelligence (Faz 4) for live transcript/coaching.
 */

export type CallDirection = "inbound" | "outbound";

/** Call lifecycle state machine: ringing → active ⇄ hold → ended. */
export type CallState = "ringing" | "active" | "hold" | "ended";

export type CallEndReason = "completed" | "missed" | "declined" | "voicemail";

export interface Extension {
  id: string;
  number: string; // short internal extension, e.g. "101"
  label: string;
}

/** Shared-line delegate (boss/admin answer-on-behalf). */
export interface Delegate {
  id: string;
  name: string;
  canAnswer: boolean;
  canPlaceOnBehalf: boolean;
}

export interface PhoneLine {
  id: string;
  e164: string; // +14155551000
  label: string;
  extensions: Extension[];
  delegates?: Delegate[];
}

export type RoutingCondition = "always" | "afterHours" | "busy" | "noAnswer";
export type RoutingActionKind = "forward" | "voicemail" | "ivr";

export interface RoutingRule {
  id: string;
  lineId: string;
  condition: RoutingCondition;
  action: RoutingActionKind;
  /** forward target (e164/extension) or ivr menu id; voicemail needs none. */
  target?: string;
}

/** Address-book entry for caller-ID resolution. */
export interface Contact {
  id: string;
  name: string;
  e164: string;
}

export interface Call {
  id: string;
  lineId: string;
  direction: CallDirection;
  from: string; // e164
  to: string; // e164
  state: CallState;
  startedAt: number; // epoch ms
  durationSec: number;
  recordingId?: string;
  endReason?: CallEndReason;
  /** Extra remote legs merged into a conference (beyond from/to). */
  participants?: string[];
  /** DTMF digits sent during the call (IVR navigation). */
  dtmf?: string;
  /** Whether this call is currently being recorded. */
  recording?: boolean;
}

export interface Voicemail {
  id: string;
  lineId: string;
  from: string; // e164
  receivedAt: number; // epoch ms
  durationSec: number;
  transcript?: string;
  heard: boolean;
}

export interface SmsMedia {
  kind: "image" | "file";
  name: string;
}

export interface SmsMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  body: string;
  sentAt: number; // epoch ms
  outbound: boolean;
  media?: SmsMedia[]; // MMS attachments
}

export interface SmsThread {
  id: string;
  contact: string; // display name
  e164: string;
  messages: SmsMessage[];
  unread: number;
  /** For group MMS threads: member numbers. */
  participants?: string[];
}

export interface ScheduledSms {
  id: string;
  threadId: string;
  body: string;
  at: number; // epoch ms to send
}

/** A reusable SMS template with {{variable}} placeholders. */
export interface SmsTemplate {
  id: string;
  name: string;
  body: string;
}

/**
 * Typed domain events = the WS contract (`call.*`) + sidecar events.
 * Mirrors the Faz 4 IntelEvent pattern; a mock dispatcher replays these and an
 * `EventSource`/WebSocket swaps in transparently.
 *
 *  CallPlaced    → "call.placed"
 *  CallAnswered  → "call.answered"
 *  CallEnded     → "call.ended"
 *  CallRouted    → "call.routed"
 *  VoicemailLeft → "voicemail.left"
 *  SmsReceived   → "sms.received"
 */
export type CallEvent =
  | { type: "call.placed"; call: Call }
  | { type: "call.answered"; callId: string }
  | { type: "call.ended"; callId: string; reason: CallEndReason }
  | { type: "call.routed"; callId: string; ruleId: string; action: RoutingActionKind }
  | { type: "voicemail.left"; voicemail: Voicemail }
  | { type: "sms.received"; message: SmsMessage };

export type CallEventType = CallEvent["type"];

/** Presence signal consumed by find-me/follow-me routing. */
export type Presence = "online" | "away" | "offline";

/* ───────────────────────── PBX core (Faz 5 — P0) ───────────────────────── */

/** Inbound distribution strategy for a call queue (Zoom + Webex parity set). */
export type RingStrategy = "simultaneous" | "round_robin" | "longest_idle" | "sequential" | "rotating" | "weighted";

export interface QueueAgent {
  id: string;
  name: string;
  /** Seconds since this agent's last handled call (longest-idle ordering). */
  idleSec: number;
  available: boolean;
  /** Skills used for skills-based routing. */
  skills?: string[];
  /** Distribution weight for the `weighted` strategy (higher = more calls). */
  weight?: number;
}

export interface QueuedCall {
  id: string;
  from: string;
  since: number; // epoch ms enqueued
  /** Caller opted for a callback instead of holding (Webex queue callback). */
  callbackRequested?: boolean;
}

export interface CallQueue {
  id: string;
  name: string;
  lineId: string;
  strategy: RingStrategy;
  agents: QueueAgent[];
  maxWaitSec: number;
  overflowAction: RoutingActionKind;
  overflowTarget?: string;
  waiting: QueuedCall[];
}

/**
 * Hunt group: rings a fixed group of users (no ACD hold/analytics) — distinct
 * from a CallQueue. `all` rings everyone; `sequential` walks the member list.
 */
export interface HuntMember {
  id: string;
  name: string;
  available: boolean;
}

export interface HuntGroup {
  id: string;
  name: string;
  ring: "all" | "sequential";
  members: HuntMember[];
}

export type IVROptionAction = "menu" | "queue" | "voicemail" | "forward" | "extension";

export interface IVROption {
  key: string; // DTMF: "1".."9","0","*","#"
  label: string;
  action: IVROptionAction;
  /** menu id / queue id / extension / e164 depending on action. */
  target?: string;
}

export interface IVRMenu {
  id: string;
  name: string;
  greeting: string;
  options: IVROption[];
}

/** Weekly business-hours window (minutes from midnight, local). */
export interface HoursWindow {
  day: number; // 0=Sun … 6=Sat
  openMin: number;
  closeMin: number;
}

export interface BusinessHours {
  id: string;
  name: string;
  timezone: string;
  weekly: HoursWindow[];
  holidays: string[]; // ISO yyyy-mm-dd
}

export interface Recording {
  id: string;
  callId: string;
  startedAt: number;
  durationSec: number;
  consent: boolean;
  transcriptId?: string;
}

/* ───────────────────────── Agent / supervisor (Faz 5 — P1) ───────────────── */

/** Supervisor live-monitoring mode on an agent's active call. */
export type MonitorMode = "listen" | "whisper" | "barge" | "takeover";

export type CallOutcome = "resolved" | "follow_up" | "no_answer" | "sale" | "spam";

/** After-call wrap-up / disposition synced to the customer profile. */
export interface Disposition {
  callId: string;
  outcome: CallOutcome;
  note: string;
  tags: string[];
}

/** Caller reputation classification (spam / robocall labeling). */
export type CallerClass = "trusted" | "unknown" | "spam" | "blocked";

export interface VoicemailGreeting {
  id: string;
  name: string;
}

/* ─────────────── AI Receptionist (virtual front desk) ───────────────────
 * Always-on AI that greets callers, recognizes intent, answers FAQs, routes,
 * captures details and books — escalating to a human on demand.
 * Parity: Zoom Virtual Agent AI Receptionist / MS Teams Copilot Call Delegation.
 */

/** What the receptionist does once it recognizes a caller's intent. */
export type ReceptionistActionKind =
  | "route_queue" // hand off to a call queue (ACD)
  | "route_extension" // ring a specific extension
  | "answer_faq" // speak a canned answer and stay on the line
  | "book" // capture details for an appointment/callback
  | "voicemail" // send to voicemail
  | "human"; // escalate to a live agent

export interface ReceptionistIntent {
  id: string;
  label: string;
  /** Trigger phrases/keywords; matched case-insensitively by token overlap. */
  phrases: string[];
  action: ReceptionistActionKind;
  /** queue id / extension / e164 depending on `action`. */
  target?: string;
  /** Spoken answer used when `action === "answer_faq"`. */
  answer?: string;
}

/** Fields the receptionist can collect before routing/booking. */
export type CaptureField = "name" | "phone" | "reason";

export interface ReceptionistConfig {
  id: string;
  enabled: boolean;
  /** Greeting played to callers during open hours. */
  greeting: string;
  /** Greeting used outside `hoursId` (after-hours). */
  afterHoursGreeting: string;
  /** BusinessHours id gating open vs. after-hours behavior. */
  hoursId: string;
  intents: ReceptionistIntent[];
  captureFields: CaptureField[];
  /** Action taken when no intent matches. */
  fallback: ReceptionistActionKind;
  /** SMS follow-up after the call (Zoom AI Receptionist SMS parity). */
  smsFollowUp: boolean;
}

/** One turn in a (mock) live receptionist conversation. */
export interface ReceptionistTurn {
  id: string;
  who: "caller" | "ai";
  text: string;
}

/** A simulated/live receptionist call session. */
export interface ReceptionistSession {
  turns: ReceptionistTurn[];
  detectedIntentId?: string;
  action?: ReceptionistActionKind;
  captured: { name?: string; phone?: string; reason?: string };
  done: boolean;
}
