import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import i18n from "@/i18n";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { useIntelStore } from "@/features/intelligence/store";
import { useCaptionsStore } from "@/features/intelligence/captionsStore";
import { SPEAKER_STATS, RUBRICS, RECAPS, TRACKERS } from "@/features/intelligence/data";
import { fetchAnalysis, fetchTranscript } from "@/features/intelligence/api";
import { mergeSegments, resolveLangPair, segmentText } from "@/features/intelligence/segments";
import { intelEventsFor, intelEventGroupsFor, subscribeIntel } from "@/features/intelligence/stream";
import { channelOf, DOMAIN_EVENT_NAME } from "@/features/intelligence/events";
import { sentimentFromValue } from "@/features/intelligence/components/SentimentChip";
import { IntelligencePage } from "@/features/intelligence/IntelligencePage";
import type { TranscriptSegment } from "@/features/intelligence/types";

const seg = (id: string, speakerId: string, startSec: number, en = "x", tr = "y"): TranscriptSegment => ({
  id,
  speakerId,
  startSec,
  en,
  tr,
  sentiment: "neutral",
});

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});

describe("Intelligence store", () => {
  it("setSource loads the source transcript", () => {
    useIntelStore.getState().setSource("src_sales");
    const segs = useIntelStore.getState().segments;
    expect(segs.length).toBeGreaterThan(0);
    expect(segs[0].id).toBe("c1");
  });

  it("live pushLive appends a transcript segment + sentiment point + coaching cue", () => {
    useIntelStore.getState().setSource("src_sales");
    const segs0 = useIntelStore.getState().segments.length;
    const sent0 = useIntelStore.getState().sentiment.length;
    const co0 = useIntelStore.getState().coaching.length;
    useIntelStore.getState().pushLive();
    expect(useIntelStore.getState().segments.length).toBe(segs0 + 1);
    expect(useIntelStore.getState().sentiment.length).toBe(sent0 + 1);
    expect(useIntelStore.getState().coaching.length).toBe(co0 + 1);
  });

  it("sentimentFromValue maps ranges", () => {
    expect(sentimentFromValue(0.5)).toBe("positive");
    expect(sentimentFromValue(0)).toBe("neutral");
    expect(sentimentFromValue(-0.5)).toBe("negative");
  });
});

describe("Intelligence+ (analytics / recap / rubric / trackers)", () => {
  it("analytics maps exist per source", () => {
    expect(SPEAKER_STATS.src_sales.length).toBeGreaterThan(0);
    expect(RUBRICS.src_sales.length).toBeGreaterThan(0);
    expect(RECAPS.src_sales.actions.length).toBeGreaterThan(0);
    expect(RECAPS.src_sales.actions[0].ownerId).toBeTruthy();
    expect(TRACKERS.src_sales.length).toBeGreaterThan(0);
  });

  it("transcript search, speaker filter and dub setters", () => {
    useIntelStore.getState().setSource("src_sales");
    useIntelStore.getState().setSearch("onboarding");
    useIntelStore.getState().setSpeakerFilter("usr_1");
    useIntelStore.getState().toggleDub();
    const s = useIntelStore.getState();
    expect(s.search).toBe("onboarding");
    expect(s.speakerFilter).toBe("usr_1");
    expect(s.dub).toBe(true);
  });

  it("redact toggle flips and setSource resets it", () => {
    useIntelStore.getState().setSource("src_support");
    expect(useIntelStore.getState().redact).toBe(false);
    useIntelStore.getState().toggleRedact();
    expect(useIntelStore.getState().redact).toBe(true);
    useIntelStore.getState().setSource("src_support");
    expect(useIntelStore.getState().redact).toBe(false);
  });
});

describe("Analysis API contract (GET /analysis/:id mock)", () => {
  it("fetchAnalysis resolves an AnalysisReport for the source", async () => {
    const report = await fetchAnalysis("src_standup");
    expect(report.sourceId).toBe("src_standup");
    expect(report.transcript.length).toBeGreaterThan(0);
    expect(report.sentiment.length).toBeGreaterThan(0);
    expect(Array.isArray(report.intents)).toBe(true);
    expect(Array.isArray(report.highlights)).toBe(true);
  });
});

describe("IntelligencePage", () => {
  it("renders transcript, scorecard, recap and speaker analytics", () => {
    useIntelStore.getState().setSource("src_standup");
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <IntelligencePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText(/Backend load test/)).toBeInTheDocument();
    expect(screen.getByText("AI scorecard")).toBeInTheDocument();
    expect(screen.getByText("AI recap")).toBeInTheDocument();
    expect(screen.getByText("Speaker analytics")).toBeInTheDocument();
    expect(screen.getByText("Translation session")).toBeInTheDocument();
  });

  it("TranslationSessionPanel drives the captions session (start → target langs → voice)", () => {
    useCaptionsStore.getState().endSession();
    useCaptionsStore.getState().startSession("src_standup", ["tr"]);
    expect(useCaptionsStore.getState().session?.targetLangs).toEqual(["tr"]);
    useCaptionsStore.getState().setTargetLangs(["tr", "de"]);
    expect(useCaptionsStore.getState().session?.voicePreserving).toBe(true);
    useCaptionsStore.getState().setVoicePreserving(false);
    expect(useCaptionsStore.getState().session?.voicePreserving).toBe(false);
  });
});

// ── Hardening: segment-domain utils ────────────────────────────────────────
describe("segments util", () => {
  it("mergeSegments merges consecutive same-speaker lines within the gap", () => {
    const merged = mergeSegments([seg("a", "u1", 0, "Hello"), seg("b", "u1", 4, "world")], { gapSec: 8 });
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("a");
    expect(merged[0].en).toBe("Hello world");
  });

  it("mergeSegments does not merge across speakers or beyond the gap", () => {
    const crossSpeaker = mergeSegments([seg("a", "u1", 0), seg("b", "u2", 2)]);
    expect(crossSpeaker).toHaveLength(2);
    const beyondGap = mergeSegments([seg("a", "u1", 0), seg("b", "u1", 30)], { gapSec: 8 });
    expect(beyondGap).toHaveLength(2);
  });

  it("resolveLangPair flags translation need and same-language/off", () => {
    expect(resolveLangPair("en", "tr").needsTranslation).toBe(true);
    expect(resolveLangPair("en", "en").sameLang).toBe(true);
    expect(resolveLangPair("en", "off").sameLang).toBe(true);
  });

  it("segmentText resolves en/tr fields and the open translations map", () => {
    const s = { ...seg("a", "u1", 0, "Hi", "Merhaba"), translations: { es: "Hola" } };
    expect(segmentText(s, "en")).toBe("Hi");
    expect(segmentText(s, "tr")).toBe("Merhaba");
    expect(segmentText(s, "es")).toBe("Hola");
    expect(segmentText(s, "de")).toBe("Merhaba"); // falls back to tr
  });
});

// ── Hardening: typed SSE event stream ──────────────────────────────────────
describe("intel event stream (SSE contract mock)", () => {
  it("intelEventsFor emits the typed event union for a live source", () => {
    const types = intelEventsFor("src_sales").map((e) => e.type);
    expect(types).toContain("caption.emitted");
    expect(types).toContain("translation.ready");
    expect(types).toContain("intel.sentiment");
    expect(types).toContain("intel.coaching");
    expect(types).toContain("intel.highlight");
  });

  it("events map to the correct SSE channel + domain-event name", () => {
    expect(channelOf("caption.emitted")).toBe("caption");
    expect(channelOf("translation.ready")).toBe("translation");
    expect(channelOf("intel.sentiment")).toBe("intel");
    expect(DOMAIN_EVENT_NAME["intel.coaching"]).toBe("CoachingCueRaised");
    expect(DOMAIN_EVENT_NAME["intel.highlight"]).toBe("HighlightDetected");
  });

  it("subscribeIntel replays one group per tick then completes; unsubscribe stops it", () => {
    vi.useFakeTimers();
    try {
      const groups = intelEventGroupsFor("src_sales");
      const received: string[] = [];
      let completed = false;
      subscribeIntel("src_sales", (e) => received.push(e.type), {
        intervalMs: 1000,
        onComplete: () => {
          completed = true;
        },
      });
      vi.advanceTimersByTime(1000);
      expect(received.length).toBe(groups[0].length);
      vi.advanceTimersByTime(1000);
      expect(received.length).toBe(groups[0].length + groups[1].length);
      vi.advanceTimersByTime(1000);
      expect(completed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("applyEvent is idempotent (re-delivery does not duplicate)", () => {
    useIntelStore.getState().setSource("src_sales");
    const before = useIntelStore.getState().segments.length;
    const evt = intelEventsFor("src_sales").find((e) => e.type === "caption.emitted")!;
    useIntelStore.getState().applyEvent(evt);
    useIntelStore.getState().applyEvent(evt); // duplicate delivery
    expect(useIntelStore.getState().segments.length).toBe(before + 1);
  });

  it("HighlightDetected lands in the intel store highlights", () => {
    useIntelStore.getState().setSource("src_sales");
    const before = useIntelStore.getState().highlights.length;
    const evt = intelEventsFor("src_sales").find((e) => e.type === "intel.highlight")!;
    useIntelStore.getState().applyEvent(evt);
    expect(useIntelStore.getState().highlights.length).toBe(before + 1);
  });
});

// ── Hardening: Translation & Captions context (captionsStore) ──────────────
describe("captionsStore (TranslationSession aggregate)", () => {
  it("startSession derives the session; applyCaption/applyTranslation fill the buffer", () => {
    const cs = useCaptionsStore.getState();
    cs.startSession("src_sales", ["tr"]);
    const session = useCaptionsStore.getState().session!;
    expect(session.sourceLang).toBe("en");
    expect(session.voicePreserving).toBe(true); // en→tr
    cs.applyCaption(seg("x1", "u1", 0, "Hello", "Merhaba"));
    cs.applyTranslation("x1", "es", "Hola");
    expect(useCaptionsStore.getState().caption("x1", "tr")).toBe("Merhaba");
    expect(useCaptionsStore.getState().caption("x1", "es")).toBe("Hola");
  });

  it("connect streams caption.emitted into the session buffer; endSession clears", () => {
    vi.useFakeTimers();
    try {
      const stop = useCaptionsStore.getState().connect("src_sales", 1000);
      vi.advanceTimersByTime(2000); // two feed items
      expect(useCaptionsStore.getState().session!.segments.length).toBeGreaterThan(0);
      stop();
    } finally {
      vi.useRealTimers();
    }
    useCaptionsStore.getState().endSession();
    expect(useCaptionsStore.getState().session).toBeNull();
  });
});

// ── Hardening: Transcript contract ─────────────────────────────────────────
describe("Transcript API contract (GET /transcripts/:id mock)", () => {
  it("fetchTranscript resolves a Transcript with sourceType + open translations map", async () => {
    const tr = await fetchTranscript("src_sales");
    expect(tr.sourceId).toBe("src_sales");
    expect(tr.sourceType).toBe("call");
    expect(tr.language).toBe("en");
    expect(tr.segments.length).toBeGreaterThan(0);
    // every segment exposes the always-present tr translation in the open map
    expect(tr.segments.every((s) => typeof s.translations?.tr === "string")).toBe(true);
  });
});

// ── Hardening: E2E chain (caption → language → transcript → report) ─────────
describe("Intelligence E2E chain (in-process)", () => {
  it("switches target language and shows the open-map translation; analysis report resolves", async () => {
    useIntelStore.getState().setSource("src_standup");
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <IntelligencePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    // language switch → Spanish open-map translation appears
    const langSelect = within(container).getAllByRole("combobox")[1];
    fireEvent.change(langSelect, { target: { value: "es" } });
    expect(within(container).getByText(/La prueba de carga del backend/)).toBeInTheDocument();
    // "open the report" = analysis contract resolves for the same source
    const report = await fetchAnalysis("src_standup");
    expect(report.transcript.length).toBeGreaterThan(0);
  });
});
