import { create } from "zustand";
import { capArray } from "@/lib/capArray";
import { COACHING, HIGHLIGHTS, SENTIMENT, SOURCES, TRANSCRIPTS } from "./data";
import { intelEventGroupsFor } from "./stream";
import type { CoachingCue, Highlight, IntelEvent, SentimentPoint, TranscriptSegment } from "./types";

interface IntelState {
  activeSourceId: string;
  segments: TranscriptSegment[];
  sentiment: SentimentPoint[];
  coaching: CoachingCue[];
  highlights: Highlight[];
  live: boolean;
  feedIndex: number;
  targetLang: string; // "off" | "tr" | "en" | …
  search: string;
  speakerFilter: string | null;
  dub: boolean;
  redact: boolean;

  setSource: (id: string) => void;
  setTargetLang: (code: string) => void;
  toggleLive: () => void;
  setSearch: (q: string) => void;
  setSpeakerFilter: (id: string | null) => void;
  toggleDub: () => void;
  toggleRedact: () => void;
  /** Apply one typed SSE event to the read models (single mutation path). */
  applyEvent: (evt: IntelEvent) => void;
  /** Advance the simulated live stream by one feed item (interval-driven). */
  pushLive: () => void;
}

const DEFAULT = SOURCES[0].id;

export const useIntelStore = create<IntelState>((set, get) => ({
  activeSourceId: DEFAULT,
  segments: TRANSCRIPTS[DEFAULT] ?? [],
  sentiment: SENTIMENT[DEFAULT] ?? [],
  coaching: COACHING[DEFAULT] ?? [],
  highlights: HIGHLIGHTS[DEFAULT] ?? [],
  live: false,
  feedIndex: 0,
  targetLang: "off",
  search: "",
  speakerFilter: null,
  dub: false,
  redact: false,

  setSource: (id) =>
    set({
      activeSourceId: id,
      segments: TRANSCRIPTS[id] ?? [],
      sentiment: SENTIMENT[id] ?? [],
      coaching: COACHING[id] ?? [],
      highlights: HIGHLIGHTS[id] ?? [],
      live: false,
      feedIndex: 0,
      search: "",
      speakerFilter: null,
      dub: false,
      redact: false,
    }),
  setTargetLang: (code) => set({ targetLang: code }),
  toggleLive: () => set((s) => ({ live: !s.live })),
  setSearch: (q) => set({ search: q }),
  setSpeakerFilter: (id) => set({ speakerFilter: id }),
  toggleDub: () => set((s) => ({ dub: !s.dub })),
  toggleRedact: () => set((s) => ({ redact: !s.redact })),

  applyEvent: (evt) =>
    set((s) => {
      // Idempotent: at-least-once delivery (or re-subscribe) must not duplicate.
      if (evt.sourceId !== s.activeSourceId) return {};
      switch (evt.type) {
        case "caption.emitted":
          if (s.segments.some((x) => x.id === evt.segment.id)) return {};
          return { segments: capArray([...s.segments, evt.segment], 300) };
        case "intel.sentiment":
          if (s.sentiment.some((p) => p.tSec === evt.point.tSec)) return {};
          return { sentiment: capArray([...s.sentiment, evt.point], 300) };
        case "intel.coaching":
          if (s.coaching.some((x) => x.id === evt.cue.id)) return {};
          return { coaching: capArray([...s.coaching, evt.cue], 60) };
        case "intel.highlight":
          if (s.highlights.some((x) => x.id === evt.highlight.id)) return {};
          return { highlights: capArray([...s.highlights, evt.highlight], 60) };
        case "translation.ready":
          return {}; // translation buffer is owned by captionsStore
        default:
          return {};
      }
    }),

  pushLive: () => {
    const s = get();
    const groups = intelEventGroupsFor(s.activeSourceId);
    if (s.feedIndex >= groups.length) {
      set({ live: false });
      return;
    }
    for (const e of groups[s.feedIndex]) get().applyEvent(e);
    set({ feedIndex: s.feedIndex + 1 });
  },
}));
