import type { AccessTier, Caption, MeetingNotes, ParticipantRole, ResolutionLevel } from "./types";

/**
 * Pure Google-Meet-parity helpers (access tiers, multi-pin, locks, quality,
 * AI notes). Framework-free → unit-testable.
 */

/** Max simultaneously pinned tiles (Google Meet multi-pin ceiling). */
export const MAX_PINS = 6;

/** Toggle an id in the pinned list, capped at `max` (no-op when full). */
export function togglePinList(pinned: string[], id: string, max = MAX_PINS): string[] {
  if (pinned.includes(id)) return pinned.filter((p) => p !== id);
  if (pinned.length >= max) return pinned;
  return [...pinned, id];
}

/** Access-tier admission decision for an arriving participant. */
export function accessTierDecision(
  tier: AccessTier,
  ctx: { invited: boolean; trustedDomain: boolean },
): "admit" | "knock" | "deny" {
  if (tier === "open") return "admit";
  if (tier === "trusted") return ctx.invited || ctx.trustedDomain ? "admit" : "knock";
  // restricted: invited only; everyone else is denied (not even knock)
  return ctx.invited ? "admit" : "deny";
}

/** Whether a participant may unmute given the audio lock (hosts bypass). */
export function effectiveCanUnmute(audioLock: boolean, role: ParticipantRole): boolean {
  if (role === "host" || role === "cohost") return true;
  if (role === "viewer") return false;
  return !audioLock;
}

/** Whether a participant may turn their camera on (video lock + viewer gate). */
export function effectiveCanCam(videoLock: boolean, role: ParticipantRole): boolean {
  if (role === "host" || role === "cohost") return true;
  if (role === "viewer") return false;
  return !videoLock;
}

export interface ResolutionProfile {
  level: ResolutionLevel;
  label: string;
  /** Approximate uplink in kbps (0 = audio only). */
  kbps: number;
}

/** Map a resolution level to a label + approximate bitrate. */
export function resolutionProfile(level: ResolutionLevel): ResolutionProfile {
  switch (level) {
    case "fhd":
      return { level, label: "1080p", kbps: 3200 };
    case "hd":
      return { level, label: "720p", kbps: 1800 };
    case "sd":
      return { level, label: "360p", kbps: 600 };
    case "audio":
      return { level, label: "Audio only", kbps: 0 };
    default:
      return { level: "auto", label: "Auto", kbps: 2000 };
  }
}

const DECISION_CUES = ["decid", "agree", "go with", "approved", "karar", "anlaş", "onayla"];
const NEXTSTEP_CUES = ["next", "action", "follow up", "will ", "todo", "sonraki", "yapılacak", "takip"];

/**
 * Build structured meeting notes from the live captions ("Take Notes for Me":
 * Summary + Decisions + Next steps). Deterministic transcript transform.
 */
export function buildMeetingNotes(captions: Caption[]): MeetingNotes {
  const texts = captions.map((c) => c.text.trim()).filter(Boolean);
  const summary = texts.slice(0, 2).join(" ");
  const has = (t: string, cues: string[]) => {
    const low = t.toLowerCase();
    return cues.some((c) => low.includes(c));
  };
  return {
    summary,
    decisions: texts.filter((t) => has(t, DECISION_CUES)),
    nextSteps: texts.filter((t) => has(t, NEXTSTEP_CUES)),
  };
}
