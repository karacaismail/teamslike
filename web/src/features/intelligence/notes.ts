import type { TranscriptSegment } from "./types";

/**
 * Meeting-notes intelligence (notta/otter parity, Faz 4): speaker diarization +
 * words-per-minute, keyword extraction and action-item detection. Pure +
 * framework-free so it's unit-tested directly. Operates on the source `en` text.
 */
export interface SpeakerStat {
  speakerId: string;
  name: string;
  words: number;
  seconds: number;
  wpm: number;
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "is", "are", "was", "were",
  "be", "it", "that", "this", "for", "with", "at", "by", "we", "i", "you", "he", "she",
  "they", "our", "lets", "one", "still", "quick", "everyone", "great",
]);

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Per-speaker speaking time (estimated from segment gaps) + words-per-minute. */
export function speakerStats(segs: TranscriptSegment[], tailSec = 30): SpeakerStat[] {
  const byId = new Map<string, { name: string; words: number; seconds: number }>();
  const sorted = [...segs].sort((a, b) => a.startSec - b.startSec);
  sorted.forEach((s, i) => {
    const dur = i < sorted.length - 1 ? Math.max(1, sorted[i + 1].startSec - s.startSec) : tailSec;
    const cur = byId.get(s.speakerId) ?? { name: s.speakerName ?? s.speakerId, words: 0, seconds: 0 };
    cur.words += words(s.en).length;
    cur.seconds += dur;
    byId.set(s.speakerId, cur);
  });
  return [...byId.entries()].map(([speakerId, v]) => ({
    speakerId,
    name: v.name,
    words: v.words,
    seconds: v.seconds,
    wpm: v.seconds > 0 ? Math.round((v.words / v.seconds) * 60) : 0,
  }));
}

/** Top keywords by frequency (stopwords + short tokens removed). */
export function topKeywords(segs: TranscriptSegment[], n = 8): { word: string; count: number }[] {
  const freq = new Map<string, number>();
  for (const s of segs) {
    for (const w of words(s.en)) {
      if (w.length < 3 || STOPWORDS.has(w)) continue;
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, n);
}

const ACTION_CUE =
  /\b(action item|to-?do|follow[- ]?up|will|need to|let'?s|by (monday|tuesday|wednesday|thursday|friday|tomorrow|eod|\d{1,2}:\d{2}))\b/i;

/** Likely action-item sentences from the transcript. */
export function actionItems(segs: TranscriptSegment[]): string[] {
  return segs.filter((s) => ACTION_CUE.test(s.en)).map((s) => s.en);
}
