import type { Clip, ClipChapter } from "./types";

/**
 * Pure Clips (async-video) helpers — Loom-parity AI + privacy + engagement.
 * Framework-free → unit-testable. AI outputs are deterministic transforms of
 * the transcript (a real backend would call an LLM with the same contract).
 *
 * Differentiator vs Loom: filler-word removal & AI workflows work in TR + EN
 * (Loom gates filler removal and doc workflows to English only).
 */

/** Filler words/phrases stripped by `removeFillerWords` — English + Turkish. */
const FILLER_WORDS = [
  // English
  "um",
  "uh",
  "erm",
  "like",
  "you know",
  "i mean",
  "actually",
  "basically",
  "literally",
  "sort of",
  "kind of",
  // Turkish
  "şey",
  "yani",
  "işte",
  "hani",
  "falan",
  "aslında",
  "aslında ya",
];

const ACTION_CUES = [
  "follow up",
  "todo",
  "action",
  "need to",
  "we should",
  "should",
  "let's",
  "next step",
  "ship",
  // Turkish
  "yapılacak",
  "takip",
  "gerekiyor",
  "sonraki adım",
  "halletmeli",
];

/** Split transcript into trimmed, non-empty sentences. */
function sentences(transcript: string): string[] {
  return transcript
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Remove filler words/phrases (case-insensitive, EN + TR) and tidy spacing. */
export function removeFillerWords(text: string): string {
  let out = text;
  for (const f of FILLER_WORDS) {
    // word-boundary, case-insensitive, allow trailing comma
    const re = new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b,?`, "gi");
    out = out.replace(re, "");
  }
  return out.replace(/\s{2,}/g, " ").replace(/\s+([.,!?])/g, "$1").trim();
}

/** First 1–2 sentences trimmed to `maxLen` → an auto-summary. */
export function autoSummary(transcript: string, maxLen = 140): string {
  const text = sentences(transcript).slice(0, 2).join(". ");
  if (!text) return "";
  const withDot = text.endsWith(".") ? text : `${text}.`;
  return withDot.length > maxLen ? `${withDot.slice(0, maxLen - 1).trimEnd()}…` : withDot;
}

/** Evenly time-stamped chapters from the transcript (up to `max`). */
export function autoChapters(transcript: string, durationSec: number, max = 5): ClipChapter[] {
  const segs = sentences(transcript).slice(0, max);
  if (segs.length === 0) return [];
  return segs.map((seg, i) => ({
    atSec: Math.round((i / segs.length) * Math.max(0, durationSec)),
    title: seg.split(/\s+/).slice(0, 5).join(" "),
  }));
}

/** Sentences that look like action items (EN + TR cue words). */
export function extractTasks(transcript: string): string[] {
  return sentences(transcript).filter((s) => {
    const low = s.toLowerCase();
    return ACTION_CUES.some((cue) => low.includes(cue));
  });
}

/** Clip → SOP/step doc text (AI workflow: video → document). */
export function clipToDoc(clip: Clip): string {
  const steps = sentences(clip.transcript);
  const body = steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
  return `# ${clip.title}\n\n${body}`;
}

/** Clip → work-item (Jira/Linear) title + body (AI workflow). */
export function clipToWorkItem(clip: Clip): { title: string; body: string } {
  const tasks = clip.tasks && clip.tasks.length > 0 ? clip.tasks : extractTasks(clip.transcript);
  const body = tasks.map((t) => `- [ ] ${t}`).join("\n") || clip.transcript;
  return { title: clip.title, body };
}

/** Clip → chat/email-tone message (AI workflow). */
export function clipToMessage(clip: Clip): string {
  const summary = clip.summary || autoSummary(clip.transcript);
  return `Recorded a quick clip — "${clip.title}". ${summary}`;
}

/** Public link expired? (no expiry = never). */
export function isLinkExpired(clip: Clip, now: number = Date.now()): boolean {
  return typeof clip.linkExpiresAt === "number" && clip.linkExpiresAt <= now;
}

/** Completion ratio clamped to 0..1 (engagement). */
export function completionRate(clip: Clip): number {
  const r = clip.completionRate ?? 0;
  return Math.max(0, Math.min(1, r));
}

/** Total reactions across all emojis. */
export function reactionTotal(clip: Clip): number {
  return (clip.reactions ?? []).reduce((sum, r) => sum + r.count, 0);
}

/** Clips sorted by views desc (analytics "top clips"). */
export function topClips(clips: Clip[], n = 5): Clip[] {
  return clips
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, n);
}
