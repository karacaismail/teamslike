import { HIGHLIGHTS, INTENTS, SCORECARDS, SENTIMENT, SOURCES, TRANSCRIPTS } from "./data";
import type { AnalysisReport, Transcript, TranscriptSegment, TranscriptSourceType } from "./types";

/** Expose the always-present tr text inside the open `translations` map for the contract. */
function withTranslationsMap(seg: TranscriptSegment): TranscriptSegment {
  return { ...seg, translations: { tr: seg.tr, ...(seg.translations ?? {}) } };
}

/**
 * Mock of the FastAPI contract `GET /transcripts/:id`. Returns the raw,
 * language-resolved transcript (separate read model from `/analysis/:id`).
 */
export function fetchTranscript(sourceId: string): Promise<Transcript> {
  const src = SOURCES.find((s) => s.id === sourceId);
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          id: `tr_${sourceId}`,
          sourceType: (src?.kind ?? "conversation") as TranscriptSourceType,
          sourceId,
          language: src?.language ?? "en",
          segments: (TRANSCRIPTS[sourceId] ?? []).map(withTranslationsMap),
        }),
      150,
    ),
  );
}

/**
 * Mock of the FastAPI contract `GET /analysis/:id`. The real backend assembles
 * this from ASR + MT + LLM; swapping this for an OpenAPI-typed httpClient keeps
 * the UI unchanged.
 */
export function fetchAnalysis(sourceId: string): Promise<AnalysisReport> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          sourceId,
          transcript: TRANSCRIPTS[sourceId] ?? [],
          sentiment: SENTIMENT[sourceId] ?? [],
          intents: INTENTS[sourceId] ?? [],
          scorecard: SCORECARDS[sourceId],
          highlights: HIGHLIGHTS[sourceId] ?? [],
        }),
      200,
    ),
  );
}
