/**
 * Messaging bounded context — feature-local types.
 * We CLONE the chat experience of Slack, Teams, WhatsApp, Chatwoot and Telegram
 * natively (not as integrations). FastAPI-compatible shape (Faz 2).
 */
export type ChannelKind =
  | "channel" // public (Slack/Teams)
  | "private" // private channel
  | "shared" // cross-org / B2B (Teams Connect / shared channel)
  | "broadcast" // one-way broadcast (Telegram/WhatsApp channel)
  | "dm"; // direct / customer conversation

/** Teams message priority. `urgent` re-notifies until read (see urgentRepeatSchedule). */
export type MessagePriority = "normal" | "important" | "urgent";

/** Chatwoot-style conversation lifecycle (for customer/support DMs). */
export type ConversationStatus = "open" | "pending" | "resolved";

export type DeliveryStatus = "sending" | "sent" | "delivered" | "read";
export type MessageKind =
  | "text"
  | "voice"
  | "note"
  | "system"
  | "call"
  | "poll"
  | "file"
  | "sticker";

export interface FileAttachment {
  name: string;
  fileType: string;
  sizeKb: number;
  isImage?: boolean;
}
export type ChatFolder = "all" | "unread" | "dms" | "channels";
export type DisappearTimer = "off" | "24h" | "7d";
export type ConvPriority = "urgent" | "high" | "medium" | "low";

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}
export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  multi?: boolean;
  anonymous?: boolean;
  quiz?: boolean;
  correctOptionId?: string;
  closed?: boolean;
}

export interface Channel {
  id: string;
  kind: ChannelKind;
  name: string;
  /** Workspace this channel belongs to (J5); undefined = visible in every workspace (DMs). */
  workspaceId?: string;
  unread?: number;
  dmUserId?: string;
  e2ee?: boolean;
  subscribers?: number;
  // Telegram/WhatsApp chat-level
  pinned?: boolean;
  muted?: boolean;
  // Chatwoot conversation fields
  isCustomer?: boolean;
  status?: ConversationStatus;
  label?: string;
  assigneeId?: string;
  priority?: ConvPriority;
  csat?: number; // 1–5 rating
  // Telegram/WhatsApp chat-level extras
  unreadManual?: boolean; // marked as unread
  disappearing?: DisappearTimer;
  archived?: boolean;
  memberIds?: string[]; // group DM / channel members
  /** For "shared" (cross-org) channels: the partner organization names. */
  externalOrgs?: string[];
}

export interface Topic {
  id: string;
  channelId: string;
  title: string;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  channelId: string;
  topicId: string;
  parentId: string | null;
  authorId: string;
  authorName?: string;
  body: string;
  bodyAlt?: string;
  tMinutes: number;
  reactions: Reaction[];

  kind?: MessageKind; // default "text"
  status?: DeliveryStatus; // outbound (WhatsApp ticks)

  edited?: boolean;
  deleted?: boolean; // delete-for-everyone tombstone
  hiddenForMe?: boolean; // delete-for-me
  pinned?: boolean;
  important?: boolean;
  priority?: MessagePriority; // Teams: normal/important/urgent (urgent re-notifies)
  saved?: boolean; // starred / saved items
  silent?: boolean; // sent without notification (Telegram)
  scheduled?: boolean;

  replyToId?: string | null;
  forwardedFrom?: string;

  voiceSec?: number;
  systemKey?: "e2ee";
  callMeetingId?: string; // kind "call" → links to a meeting
  poll?: Poll; // kind "poll"
  viewCount?: number; // Telegram broadcast view count
  ephemeral?: boolean; // disappearing message
  file?: FileAttachment; // kind "file"
  sticker?: string; // kind "sticker"

  translating?: boolean;
  translated?: boolean;
}

/** Story / Status (WhatsApp Status, Telegram Stories) — ephemeral 24h posts. */
export interface Story {
  id: string;
  authorId: string;
  kind: "text" | "image";
  text: string; // text content or image caption
  mediaName?: string;
  seenBy: string[];
  tMinutes: number; // minutes ago
}

/** Community = group-of-groups (WhatsApp Communities / Telegram folders). */
export interface Community {
  id: string;
  name: string;
  channelIds: string[];
}

export const QUICK_REACTIONS = ["👍", "✅", "🎉", "❤️", "👀", "🔥"];

/** Emoji picker palette (compact, categorized-ish). */
export const EMOJI_PALETTE = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "😎", "🤔", "😉", "🙂",
  "👍", "👎", "👏", "🙌", "🙏", "💪", "👀", "🔥", "✨", "🎉",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "✅", "❌", "⚠️", "❓",
  "🚀", "🌟", "💡", "📌", "📎", "📝", "📣", "⏰", "☕", "🍕",
];
