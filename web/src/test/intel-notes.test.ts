import { describe, it, expect } from "vitest";
import { speakerStats, topKeywords, actionItems } from "@/features/intelligence/notes";
import type { TranscriptSegment } from "@/features/intelligence/types";

const segs: TranscriptSegment[] = [
  { id: "s1", speakerId: "u2", startSec: 0, en: "Morning everyone quick standup", tr: "", sentiment: "neutral" },
  { id: "s2", speakerId: "u3", startSec: 30, en: "Pricing page is still pending and that worries me", tr: "", sentiment: "negative" },
  { id: "s3", speakerId: "u2", startSec: 90, en: "Pricing page lands by 14:00 confirmed", tr: "", sentiment: "positive" },
];

describe("notta/otter notes (Faz 4)", () => {
  it("speakerStats computes per-speaker words, seconds and WPM (diarization)", () => {
    const stats = speakerStats(segs);
    const u2 = stats.find((s) => s.speakerId === "u2")!;
    expect(u2.words).toBeGreaterThan(0);
    expect(u2.seconds).toBeGreaterThan(0);
    expect(u2.wpm).toBeGreaterThan(0);
    expect(stats.length).toBe(2); // two distinct speakers
  });
  it("topKeywords surfaces frequent domain words", () => {
    const kw = topKeywords(segs, 5);
    const pricing = kw.find((k) => k.word === "pricing");
    expect(pricing?.count).toBe(2); // appears twice
  });
  it("actionItems detects cue sentences", () => {
    const items = actionItems(segs);
    expect(items.some((x) => x.includes("lands by 14:00"))).toBe(true);
  });
});
