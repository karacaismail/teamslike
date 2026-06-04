/**
 * Conversation Intelligence & Translation bounded context (Faz 4).
 * Cross-cutting open-host service consumed by Meetings (Faz 3) and Messaging
 * (Faz 2). FastAPI-compatible: ASR + MT + LLM stream these over SSE; the UI
 * consumes the contract shape below and only swaps the transport.
 */
export type Sentiment = "positive" | "neutral" | "negative";

export interface TranscriptSegment {
  id: string;
  speakerId: string;
  speakerName?: string;
  startSec: number;
  /** Source language text (en) + Turkish translation. */
  en: string;
  tr: string;
  /**
   * Open translation map {langCode: text} — mirrors the FastAPI `Segment.translations`
   * field so any of the 70+ target languages can carry real MT output. `en`/`tr`
   * remain as the always-present pair; this map supplies the rest.
   */
  translations?: Record<string, string>;
  sentiment: Sentiment;
}

export interface SentimentPoint {
  tSec: number;
  /** -1 (negative) … 1 (positive) */
  value: number;
}

export interface Intent {
  id: string;
  label: string;
  confidence: number; // 0..1
}

export interface CoachingCue {
  id: string;
  kind: "tip" | "warning" | "praise";
  text: string;
  tSec: number;
}

export interface Highlight {
  id: string;
  kind: "decision" | "action" | "objection" | "question";
  segmentId: string;
  text: string;
}

export interface Scorecard {
  talkRatio: number; // % spoken by self/agent
  sentiment: number; // avg -1..1
  questions: number;
  pace: number; // words per minute
  monologueSec: number; // longest monologue
  csat?: number; // 1..5
  predictedCsat?: number; // AI-predicted 1..5 (Dialpad AI CSAT)
  csatReason?: string;
}

/** Per-speaker talk analytics (Dialpad/Zoom). */
export interface SpeakerStat {
  speakerId: string;
  name?: string;
  words: number;
  talkSec: number;
  sentiment: number; // -1..1
  interruptions: number;
  fillerWords: number;
}

/** Custom scorecard criterion (Dialpad AI Scorecards). */
export interface RubricItem {
  id: string;
  label: string;
  pass: boolean;
}

export interface RecapAction {
  id: string;
  text: string;
  ownerId: string;
}

/** Structured AI recap (Zoom/Teams Intelligent Recap). */
export interface Recap {
  tldr: string;
  decisions: string[];
  actions: RecapAction[];
  nextSteps: string[];
}

/** Keyword / competitor / topic tracker (Dialpad Custom Moments). */
export interface Tracker {
  id: string;
  label: string;
  kind: "keyword" | "competitor" | "topic";
  hits: number;
}

export interface IntelSource {
  id: string;
  title: string;
  kind: "meeting" | "call" | "conversation";
  language: string; // source language code
  durationSec: number;
  live?: boolean;
}

export interface LangOption {
  code: string;
  label: string;
}

/** AnalysisReport aggregate — mirrors the FastAPI contract GET /analysis/:id. */
export interface AnalysisReport {
  sourceId: string;
  transcript: TranscriptSegment[];
  sentiment: SentimentPoint[];
  intents: Intent[];
  scorecard?: Scorecard;
  highlights: Highlight[];
}

export type TranscriptSourceType = "meeting" | "call" | "webinar" | "conversation";

/**
 * Transcript aggregate — mirrors the FastAPI contract `GET /transcripts/:id`.
 * Distinct from AnalysisReport: this is the raw, language-resolved transcript;
 * analysis (sentiment/intents/scorecard) is a separate read model.
 */
export interface Transcript {
  id: string;
  sourceType: TranscriptSourceType;
  sourceId: string;
  language: string; // detected source language
  segments: TranscriptSegment[];
}

/**
 * TranslationSession aggregate — the Translation & Captions bounded context root.
 * Owns the active language pair(s) and the live caption buffer. In production a
 * session is opened against the ASR+MT stream; here it is fed by `subscribeIntel`.
 */
export interface TranslationSession {
  id: string;
  sourceId: string;
  sourceLang: string;
  targetLangs: string[];
  voicePreserving: boolean;
  segments: TranscriptSegment[];
}

/**
 * Typed domain events = the SSE contract (`caption.*`, `translation.*`, `intel.*`).
 * The mock dispatcher (`stream.ts`) replays these; swapping it for an `EventSource`
 * keeps every consumer unchanged.
 *
 *  - CaptionEmitted      → "caption.emitted"
 *  - TranslationReady    → "translation.ready"
 *  - SentimentShifted    → "intel.sentiment"
 *  - CoachingCueRaised   → "intel.coaching"
 *  - HighlightDetected   → "intel.highlight"
 */
export type IntelEvent =
  | { type: "caption.emitted"; sourceId: string; segment: TranscriptSegment }
  | { type: "translation.ready"; sourceId: string; segmentId: string; lang: string; text: string }
  | { type: "intel.sentiment"; sourceId: string; point: SentimentPoint }
  | { type: "intel.coaching"; sourceId: string; cue: CoachingCue }
  | { type: "intel.highlight"; sourceId: string; highlight: Highlight };

export type IntelEventType = IntelEvent["type"];
