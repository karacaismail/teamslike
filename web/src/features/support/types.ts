/**
 * Omnichannel Support bounded context (Faz 8 — Chatwoot-style).
 * Unified agent inbox across live-chat / email / WhatsApp / IG / FB / Telegram / SMS.
 * Consumes Translation, Conversation Intelligence and AI Orchestration.
 * Carrier-agnostic: a Chatwoot backend streams `conversation.*` over WS and
 * exposes REST; the UI consumes the contract shapes below (ACL) and only swaps
 * the transport (mock → httpClient/WebSocket).
 */

export type ChannelType = "livechat" | "email" | "whatsapp" | "instagram" | "facebook" | "telegram" | "sms";

/** Channel connection lifecycle (Embedded Signup → Coexistence → live). */
export type ChannelConnection = "connected" | "coexistence" | "pending" | "disconnected";
/** Who provisions the number/channel. */
export type ChannelProvider = "cloud_api" | "bsp" | "native";

export interface Inbox {
  id: string;
  channelType: ChannelType;
  name: string;
  connection?: ChannelConnection;
  provider?: ChannelProvider;
}

export type ConversationStatus = "open" | "pending" | "snoozed" | "resolved";
export type Priority = "urgent" | "high" | "medium" | "low" | "none";

export type AuthorType = "contact" | "agent" | "bot" | "note";
export type MessageDirection = "in" | "out";

export interface SupportAttachment {
  name: string;
  isImage?: boolean;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  authorType: AuthorType;
  authorId?: string;
  body: string;
  tMinutes: number;
  private?: boolean; // internal note
  attachments?: SupportAttachment[];
}

export interface Contact {
  id: string;
  name: string;
  identifiers: { email?: string; phone?: string; social?: string };
  attributes: Record<string, string>;
}

export interface Conversation {
  id: string;
  /** Workspace this conversation belongs to (J5); undefined = visible everywhere. */
  workspaceId?: string;
  inboxId: string;
  contactId: string;
  assigneeId?: string;
  status: ConversationStatus;
  priority: Priority;
  slaDueAt: number; // epoch ms
  labels: string[];
  unread: number;
  csat?: number; // 1..5
  messages: MessageItem[];
}

export interface Agent {
  id: string;
  name: string;
  available: boolean;
  skills?: string[];
}

export type MacroActionType = "reply" | "status" | "priority" | "label" | "assign";

export interface MacroAction {
  type: MacroActionType;
  value: string;
}

export interface Macro {
  id: string;
  name: string;
  actions: MacroAction[];
}

/** Canned response with {{variable}} placeholders, triggered by shortcode. */
export interface CannedResponse {
  id: string;
  shortcode: string; // e.g. "/refund"
  body: string;
}

export interface KbArticle {
  id: string;
  title: string;
  body: string;
}

/* ─────────── WFO / WEM (Workforce Engagement Management) ───────────────
 * Forecast → schedule → adherence + quality. Parity: Zoom Workforce
 * Engagement Management (AI forecasting/scheduling + Quality Management).
 */

/** One intraday interval: forecast demand vs. staffed agents. */
export interface StaffingInterval {
  id: string;
  label: string; // "09:00"
  forecastVolume: number; // contacts expected this interval
  required: number; // agents needed (computed)
  scheduled: number; // agents on shift
}

export interface Shift {
  id: string;
  agentId: string;
  start: string; // "09:00"
  end: string; // "17:00"
}

/** Schedule-adherence sample for an agent. */
export interface AdherenceRow {
  agentId: string;
  scheduledMin: number;
  adherentMin: number; // minutes actually on-schedule
}

/** A weighted quality-scorecard criterion. */
export interface ScorecardCriterion {
  id: string;
  label: string;
  weight: number;
}

/** A completed quality evaluation (scores 0..5 per criterion). */
export interface QaEvaluation {
  id: string;
  agentId: string;
  conversationId: string;
  scores: Record<string, number>;
}

/* ─────────── AI Agent Studio (no-code agent designer) ─────────────────
 * Design → ground → test → publish a conversational agent. Parity: Zoom AI
 * Studio / Microsoft Copilot Studio. Distinct from the visual bot-flow builder
 * (botflow.ts): this is the higher-level agent definition + sandbox.
 */

export type AgentChannel = "webchat" | "whatsapp" | "voice" | "email";
export type StudioAgentStatus = "draft" | "testing" | "published";

export interface AgentKnowledge {
  id: string;
  label: string;
  kind: "kb" | "url" | "file";
}

/** A back-end action the agent may call (mock). */
export interface AgentTool {
  id: string;
  label: string;
  enabled: boolean;
}

export interface AgentIntent {
  id: string;
  label: string;
  phrases: string[];
  reply: string;
}

export interface StudioAgent {
  id: string;
  name: string;
  /** Natural-language goal/instruction. */
  goal: string;
  channels: AgentChannel[];
  status: StudioAgentStatus;
  knowledge: AgentKnowledge[];
  tools: AgentTool[];
  intents: AgentIntent[];
  /** Mock observability counters. */
  metrics: { runs: number; resolved: number };
}

/** One turn in the studio test sandbox. */
export interface AgentTestTurn {
  id: string;
  who: "user" | "agent";
  text: string;
  intentId?: string;
}

/**
 * Typed domain events = the WS contract (`conversation.*`) + sidecars.
 *
 *  ConversationOpened   → "conversation.opened"
 *  ConversationAssigned → "conversation.assigned"
 *  ConversationResolved → "conversation.resolved"
 *  AiSuggestionOffered  → "ai.suggestion"
 *  CsatSubmitted        → "csat.submitted"
 */
export type SupportEvent =
  | { type: "conversation.opened"; conversation: Conversation }
  | { type: "conversation.assigned"; conversationId: string; assigneeId: string }
  | { type: "conversation.resolved"; conversationId: string }
  | { type: "message.received"; message: MessageItem }
  | { type: "ai.suggestion"; conversationId: string; text: string }
  | { type: "csat.submitted"; conversationId: string; rating: number };
