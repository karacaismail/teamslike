import type { TranscriptSegment } from "./types";

/**
 * Pure transcript-domain helpers (Translation & Captions context).
 * Kept framework-free so they unit-test without React/stores.
 */

/** Resolve the text of a segment for a target language code. */
export function segmentText(seg: TranscriptSegment, lang: string): string {
  if (lang === "en") return seg.en;
  if (lang === "tr") return seg.tr;
  // Open translation map first, then fall back to tr → en so the UI never blanks.
  return seg.translations?.[lang] ?? seg.tr ?? seg.en;
}

export interface LangPair {
  source: string;
  target: string;
  /** Source and target are the same language (or translation is off). */
  sameLang: boolean;
  needsTranslation: boolean;
}

/** Resolve a source→target language pair (MT routing decision). */
export function resolveLangPair(source: string, target: string): LangPair {
  const sameLang = target === "off" || source === target;
  return { source, target, sameLang, needsTranslation: !sameLang };
}

function mergeTranslations(
  a?: Record<string, string>,
  b?: Record<string, string>,
): Record<string, string> | undefined {
  if (!a && !b) return undefined;
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = [a?.[k], b?.[k]].filter(Boolean).join(" ").trim();
  return out;
}

export interface MergeOpts {
  /** Max start-time gap (sec) between consecutive same-speaker segments to merge. */
  gapSec?: number;
}

/**
 * Merge consecutive segments from the same speaker that fall within `gapSec`.
 * ASR emits many short partials; collapsing them yields readable transcript lines.
 * Latest segment's sentiment wins; the first segment's id/startSec are kept.
 */
export function mergeSegments(segs: TranscriptSegment[], opts: MergeOpts = {}): TranscriptSegment[] {
  const gap = opts.gapSec ?? 8;
  const out: TranscriptSegment[] = [];
  for (const seg of segs) {
    const prev = out[out.length - 1];
    if (prev && prev.speakerId === seg.speakerId && seg.startSec - prev.startSec <= gap) {
      out[out.length - 1] = {
        ...prev,
        en: `${prev.en} ${seg.en}`.trim(),
        tr: `${prev.tr} ${seg.tr}`.trim(),
        translations: mergeTranslations(prev.translations, seg.translations),
        sentiment: seg.sentiment,
      };
    } else {
      out.push({ ...seg });
    }
  }
  return out;
}
