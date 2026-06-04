import type { IntelEvent, IntelEventType } from "./types";

/**
 * Named domain events for the Translation & Conversation-Intelligence contexts,
 * mapped to their SSE channel. The FastAPI backend publishes on `caption.*`,
 * `translation.*` and `intel.*`; the mock dispatcher (`stream.ts`) replays the
 * same typed events so consumers never change when the transport is swapped.
 */
export const EVENT_CHANNEL: Record<IntelEventType, "caption" | "translation" | "intel"> = {
  "caption.emitted": "caption",
  "translation.ready": "translation",
  "intel.sentiment": "intel",
  "intel.coaching": "intel",
  "intel.highlight": "intel",
};

/** SSE channel an event travels on. */
export function channelOf(type: IntelEventType): "caption" | "translation" | "intel" {
  return EVENT_CHANNEL[type];
}

/** Human-readable domain-event name (CaptionEmitted, SentimentShifted, …). */
export const DOMAIN_EVENT_NAME: Record<IntelEventType, string> = {
  "caption.emitted": "CaptionEmitted",
  "translation.ready": "TranslationReady",
  "intel.sentiment": "SentimentShifted",
  "intel.coaching": "CoachingCueRaised",
  "intel.highlight": "HighlightDetected",
};

export type { IntelEvent };
