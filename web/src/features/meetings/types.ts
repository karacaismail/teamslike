/**
 * Meetings bounded context — feature-local types.
 * UX mirrors LiveKit/Jitsi rooms; media is mocked. FastAPI-compatible shape
 * (GELISTIRME-PLANI.md §6 Faz 3): Meeting → Participant → Track, Breakout,
 * Recording, plus a Translation/Captions seam consumed from Phase 4.
 */
export type MeetingPhase = "idle" | "prejoin" | "in";
export type MeetingLayout = "grid" | "speaker";
/** Where the participant filmstrip sits in speaker/screen-share view. */
export type StripPos = "bottom" | "top" | "left" | "right";
/** "viewer" = view-only (no cam/mic/present) — Google Meet "Everyone is a viewer". */
export type ParticipantRole = "host" | "cohost" | "attendee" | "viewer";
export type SidePanelTab = "none" | "participants" | "chat" | "captions" | "host" | "engage";
export type CaptionLang = "en" | "tr";
export type ConnectionQuality = "good" | "fair" | "poor";

/* ─────────── Google Meet parity: access, quality, notes ─────────── */

/** Meeting access tier (Google Meet: Open / Trusted / Restricted). */
export type AccessTier = "open" | "trusted" | "restricted";

/** Send/receive video quality ceiling. */
export type ResolutionLevel = "auto" | "fhd" | "hd" | "sd" | "audio";

/** Admin uplink/bandwidth policy. */
export type BandwidthPolicy = "auto" | "limited" | "audio";

/** Who receives the AI meeting notes doc. */
export type NotesRecipients = "all" | "inorg" | "hosts";

/** Structured AI meeting notes ("Take Notes for Me"). */
export interface MeetingNotes {
  summary: string;
  decisions: string[];
  nextSteps: string[];
}

/** Active real-time remote-screen-control session (Google leaves this absent). */
export interface RemoteControl {
  /** Participant who shared the screen being controlled. */
  presenterId: string;
  /** Participant granted control (null = pending request). */
  controllerId: string | null;
}

/** In-meeting poll (Zoom/Meet/Teams). */
export interface MeetingPoll {
  question: string;
  options: { id: string; text: string; votes: string[] }[];
  closed?: boolean;
}

/** In-meeting Q&A item. */
export interface QnaItem {
  id: string;
  authorId: string;
  text: string;
  upvotes: string[];
  answered?: boolean;
}

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  micOn: boolean;
  camOn: boolean;
  handRaised: boolean;
  isSelf?: boolean;
  screenSharing?: boolean;
  quality?: ConnectionQuality;
}

/** Persistent, moderator-created video room (Jitsi-style). */
export interface VideoRoom {
  id: string;
  name: string;
  createdBy: string;
  locked?: boolean;
  waitingRoom?: boolean;
  password?: string;
  participants?: number;
}

/** Lobby waiting entry (host admits). */
export interface LobbyEntry {
  id: string;
  name: string;
}

export interface MeetingSummary {
  id: string;
  title: string;
  host: string;
  /** minutes until start; 0 or negative = live now */
  startsInMin: number;
  participantIds: string[];
  live?: boolean;
}

/** A line of the simulated transcript (bilingual source). */
export interface CaptionLine {
  speakerId: string;
  en: string;
  tr: string;
}

/** Caption shown on screen (already language-resolved). */
export interface Caption {
  id: string;
  speaker: string;
  text: string;
}

export interface MeetingChat {
  id: string;
  authorId: string;
  body: string;
  tMin: number;
}

export interface Breakout {
  id: string;
  name: string;
  participantIds: string[];
}

export interface FloatingReaction {
  id: string;
  emoji: string;
}

export const MEETING_REACTIONS = ["👍", "👏", "🎉", "❤️", "😂", "✋"];
