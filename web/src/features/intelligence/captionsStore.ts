import { create } from "zustand";
import { SOURCES } from "./data";
import { subscribeIntel } from "./stream";
import { segmentText } from "./segments";
import type { TranscriptSegment, TranslationSession } from "./types";

/**
 * Translation & Captions bounded context store.
 *
 * Distinct from `intelStore` (Conversation Intelligence): this owns the
 * `TranslationSession` aggregate — the active language pair(s) and the live
 * caption buffer — fed by the `caption.*` / `translation.*` SSE channels. The
 * meeting surface injects a thin caption view; this is the canonical session.
 */
interface CaptionsState {
  session: TranslationSession | null;

  startSession: (sourceId: string, targetLangs?: string[]) => void;
  setTargetLangs: (langs: string[]) => void;
  setVoicePreserving: (on: boolean) => void;
  /** CaptionEmitted handler — append a segment to the buffer (capped). */
  applyCaption: (seg: TranscriptSegment) => void;
  /** TranslationReady handler — merge a target-language translation into a buffered segment. */
  applyTranslation: (segmentId: string, lang: string, text: string) => void;
  endSession: () => void;
  /** Connect to the mock SSE stream; returns an unsubscribe fn. */
  connect: (sourceId: string, intervalMs?: number) => () => void;
  /** Resolve a buffered segment's text for a language code. */
  caption: (segmentId: string, lang: string) => string | undefined;
}

const BUFFER_CAP = 50;

function deriveVoicePreserving(sourceLang: string, targetLangs: string[]): boolean {
  return targetLangs.some((l) => l !== "off" && l !== sourceLang);
}

export const useCaptionsStore = create<CaptionsState>((set, get) => ({
  session: null,

  startSession: (sourceId, targetLangs = ["tr"]) => {
    const sourceLang = SOURCES.find((s) => s.id === sourceId)?.language ?? "en";
    set({
      session: {
        id: `ts_${sourceId}`,
        sourceId,
        sourceLang,
        targetLangs,
        voicePreserving: deriveVoicePreserving(sourceLang, targetLangs),
        segments: [],
      },
    });
  },

  setTargetLangs: (langs) =>
    set((s) =>
      s.session
        ? {
            session: {
              ...s.session,
              targetLangs: langs,
              voicePreserving: deriveVoicePreserving(s.session.sourceLang, langs),
            },
          }
        : {},
    ),

  setVoicePreserving: (on) =>
    set((s) => (s.session ? { session: { ...s.session, voicePreserving: on } } : {})),

  applyCaption: (seg) =>
    set((s) =>
      s.session
        ? { session: { ...s.session, segments: [...s.session.segments, seg].slice(-BUFFER_CAP) } }
        : {},
    ),

  applyTranslation: (segmentId, lang, text) =>
    set((s) => {
      if (!s.session) return {};
      return {
        session: {
          ...s.session,
          segments: s.session.segments.map((seg) =>
            seg.id === segmentId
              ? { ...seg, translations: { ...(seg.translations ?? {}), [lang]: text } }
              : seg,
          ),
        },
      };
    }),

  endSession: () => set({ session: null }),

  connect: (sourceId, intervalMs) => {
    if (get().session?.sourceId !== sourceId) get().startSession(sourceId);
    return subscribeIntel(
      sourceId,
      (e) => {
        if (e.type === "caption.emitted") get().applyCaption(e.segment);
        else if (e.type === "translation.ready") get().applyTranslation(e.segmentId, e.lang, e.text);
      },
      { intervalMs },
    );
  },

  caption: (segmentId, lang) => {
    const seg = get().session?.segments.find((s) => s.id === segmentId);
    return seg ? segmentText(seg, lang) : undefined;
  },
}));
