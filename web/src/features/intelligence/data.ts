import type {
  CoachingCue,
  Highlight,
  Intent,
  IntelSource,
  LangOption,
  Recap,
  RubricItem,
  Scorecard,
  SentimentPoint,
  SpeakerStat,
  Tracker,
  TranscriptSegment,
} from "./types";

/** Target languages (the "70+ languages" surface; en/tr have real text). */
export const LANGS: LangOption[] = [
  { code: "off", label: "Off" },
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

export const SOURCES: IntelSource[] = [
  { id: "src_standup", title: "Daily Standup", kind: "meeting", language: "en", durationSec: 480 },
  { id: "src_sales", title: "Sales call — Acme", kind: "call", language: "en", durationSec: 540, live: true },
  { id: "src_support", title: "Support — Jordan Blake", kind: "conversation", language: "en", durationSec: 300 },
];

export const TRANSCRIPTS: Record<string, TranscriptSegment[]> = {
  src_standup: [
    { id: "s1", speakerId: "usr_2", startSec: 5, en: "Morning everyone — quick standup.", tr: "Günaydın herkese — kısa standup.", sentiment: "neutral" },
    {
      id: "s2",
      speakerId: "usr_3",
      startSec: 28,
      en: "Backend load test passed at 12k concurrent. Really happy with the numbers.",
      tr: "Backend yük testi 12k eşzamanlıda geçti. Rakamlardan çok memnunum.",
      translations: {
        es: "La prueba de carga del backend pasó a 12k simultáneos. Muy contento con las cifras.",
        de: "Backend-Lasttest bei 12k gleichzeitig bestanden. Sehr zufrieden mit den Zahlen.",
      },
      sentiment: "positive",
    },
    { id: "s3", speakerId: "usr_4", startSec: 64, en: "Dark-mode tokens are merged and propagate cleanly.", tr: "Koyu mod token'ları birleştirildi ve temiz yayılıyor.", sentiment: "positive" },
    { id: "s4", speakerId: "usr_1", startSec: 96, en: "Great. The go/no-go is at 15:00 — let's be decisive.", tr: "Harika. Go/no-go 15:00'te — kararlı olalım.", sentiment: "neutral" },
    { id: "s5", speakerId: "usr_2", startSec: 140, en: "One risk: the pricing page is still pending and that worries me.", tr: "Bir risk: fiyat sayfası hâlâ bekliyor ve bu beni endişelendiriyor.", sentiment: "negative" },
    { id: "s6", speakerId: "usr_3", startSec: 175, en: "Pricing page lands by 14:00, confirmed.", tr: "Fiyat sayfası 14:00'e iniyor, onaylandı.", sentiment: "positive" },
  ],
  src_sales: [
    {
      id: "c1",
      speakerId: "ext_jordan",
      speakerName: "Jordan (Acme)",
      startSec: 8,
      en: "We like the product, but the price feels a bit high for us.",
      tr: "Ürünü beğeniyoruz ama fiyat bize biraz yüksek geliyor.",
      translations: {
        es: "Nos gusta el producto, pero el precio nos parece un poco alto.",
        de: "Das Produkt gefällt uns, aber der Preis erscheint uns etwas hoch.",
      },
      sentiment: "negative",
    },
    { id: "c2", speakerId: "usr_1", startSec: 30, en: "Understood — annual billing saves 20%, and onboarding is included.", tr: "Anlıyorum — yıllık faturalama %20 indirim sağlar ve onboarding dahildir.", sentiment: "neutral" },
    { id: "c3", speakerId: "ext_jordan", speakerName: "Jordan (Acme)", startSec: 62, en: "If onboarding is included, that changes things. Can we start next month?", tr: "Onboarding dahilse bu işleri değiştirir. Gelecek ay başlayabilir miyiz?", sentiment: "positive" },
    { id: "c4", speakerId: "usr_1", startSec: 95, en: "Absolutely. I'll send a proposal today.", tr: "Kesinlikle. Bugün bir teklif göndereceğim.", sentiment: "positive" },
  ],
  src_support: [
    { id: "p1", speakerId: "ext_jordan", speakerName: "Jordan Blake", startSec: 4, en: "Is the Pro plan billed monthly or annually?", tr: "Pro plan aylık mı yıllık mı faturalanıyor?", sentiment: "neutral" },
    { id: "p2", speakerId: "usr_1", startSec: 22, en: "Both — and annual saves 20%.", tr: "İkisi de — ve yıllık %20 indirim sağlar.", sentiment: "positive" },
  ],
};

export const SENTIMENT: Record<string, SentimentPoint[]> = {
  src_standup: [
    { tSec: 5, value: 0 }, { tSec: 28, value: 0.6 }, { tSec: 64, value: 0.7 },
    { tSec: 96, value: 0.1 }, { tSec: 140, value: -0.5 }, { tSec: 175, value: 0.6 },
  ],
  src_sales: [
    { tSec: 8, value: -0.5 }, { tSec: 30, value: 0 }, { tSec: 62, value: 0.5 }, { tSec: 95, value: 0.8 },
  ],
  src_support: [{ tSec: 4, value: 0 }, { tSec: 22, value: 0.6 }],
};

export const INTENTS: Record<string, Intent[]> = {
  src_standup: [
    { id: "i1", label: "Launch readiness", confidence: 0.92 },
    { id: "i2", label: "Risk: pricing page", confidence: 0.71 },
  ],
  src_sales: [
    { id: "i1", label: "Pricing objection", confidence: 0.88 },
    { id: "i2", label: "Buying signal", confidence: 0.83 },
    { id: "i3", label: "Onboarding interest", confidence: 0.69 },
  ],
  src_support: [{ id: "i1", label: "Billing question", confidence: 0.95 }],
};

export const SCORECARDS: Record<string, Scorecard> = {
  src_standup: { talkRatio: 22, sentiment: 0.25, questions: 1, pace: 132, monologueSec: 34, predictedCsat: 4, csatReason: "Positive tone, risk acknowledged and resolved." },
  src_sales: { talkRatio: 48, sentiment: 0.2, questions: 3, pace: 118, monologueSec: 41, csat: 4, predictedCsat: 4, csatReason: "Objection handled; buying signal captured." },
  src_support: { talkRatio: 55, sentiment: 0.3, questions: 1, pace: 140, monologueSec: 12, csat: 5, predictedCsat: 5, csatReason: "Fast, clear answer to a billing question." },
};

/** Per-speaker talk analytics. */
export const SPEAKER_STATS: Record<string, SpeakerStat[]> = {
  src_standup: [
    { speakerId: "usr_2", words: 64, talkSec: 58, sentiment: 0.1, interruptions: 0, fillerWords: 3 },
    { speakerId: "usr_3", words: 41, talkSec: 36, sentiment: 0.7, interruptions: 1, fillerWords: 1 },
    { speakerId: "usr_4", words: 28, talkSec: 22, sentiment: 0.6, interruptions: 0, fillerWords: 0 },
    { speakerId: "usr_1", words: 22, talkSec: 18, sentiment: 0.2, interruptions: 0, fillerWords: 2 },
  ],
  src_sales: [
    { speakerId: "usr_1", name: "You", words: 88, talkSec: 96, sentiment: 0.3, interruptions: 2, fillerWords: 5 },
    { speakerId: "ext_jordan", name: "Jordan (Acme)", words: 74, talkSec: 84, sentiment: 0.1, interruptions: 1, fillerWords: 2 },
  ],
  src_support: [
    { speakerId: "usr_1", name: "You", words: 30, talkSec: 24, sentiment: 0.4, interruptions: 0, fillerWords: 1 },
    { speakerId: "ext_jordan", name: "Jordan Blake", words: 18, talkSec: 14, sentiment: 0.2, interruptions: 0, fillerWords: 0 },
  ],
};

/** Custom AI scorecard rubric (auto pass/fail). */
export const RUBRICS: Record<string, RubricItem[]> = {
  src_sales: [
    { id: "r1", label: "Introduced themselves & company", pass: true },
    { id: "r2", label: "Acknowledged the objection", pass: true },
    { id: "r3", label: "Quantified value (discount / onboarding)", pass: true },
    { id: "r4", label: "Asked for a next step / close", pass: true },
    { id: "r5", label: "Confirmed budget", pass: false },
  ],
  src_support: [
    { id: "r1", label: "Greeted the customer", pass: true },
    { id: "r2", label: "Answered the question directly", pass: true },
    { id: "r3", label: "Offered a follow-up", pass: false },
  ],
  src_standup: [],
};

/** Structured AI recap (Zoom/Teams Intelligent Recap). */
export const RECAPS: Record<string, Recap> = {
  src_standup: {
    tldr: "Launch is on track; the only open risk (pricing page) has a 14:00 fix; go/no-go at 15:00.",
    decisions: ["Go/no-go decision at 15:00", "Ship Q3 launch pending pricing page"],
    actions: [
      { id: "a1", text: "Finalize the load-test report", ownerId: "usr_3" },
      { id: "a2", text: "Publish dark-mode tokens", ownerId: "usr_4" },
      { id: "a3", text: "Land pricing page by 14:00", ownerId: "usr_2" },
    ],
    nextSteps: ["Reconvene at 15:00 for go/no-go"],
  },
  src_sales: {
    tldr: "Acme is interested; price objection resolved via annual discount + included onboarding; proposal to follow.",
    decisions: ["Proceed with a proposal", "Annual billing offered (20% off)"],
    actions: [
      { id: "a1", text: "Send proposal to Acme today", ownerId: "usr_1" },
      { id: "a2", text: "Confirm go-live date and budget", ownerId: "usr_1" },
    ],
    nextSteps: ["Loop in Acme procurement", "Schedule onboarding kickoff"],
  },
  src_support: {
    tldr: "Customer asked about billing cadence; answered (monthly/annual, 20% off annual).",
    decisions: [],
    actions: [{ id: "a1", text: "Send the pricing page link", ownerId: "usr_1" }],
    nextSteps: ["Follow up on plan selection"],
  },
};

/** Custom Moments / trackers (Dialpad). */
export const TRACKERS: Record<string, Tracker[]> = {
  src_sales: [
    { id: "t1", label: "Pricing / discount", kind: "keyword", hits: 4 },
    { id: "t2", label: "Competitor: Rival.io", kind: "competitor", hits: 1 },
    { id: "t3", label: "Onboarding", kind: "topic", hits: 2 },
  ],
  src_standup: [
    { id: "t1", label: "Launch / go-live", kind: "keyword", hits: 5 },
    { id: "t2", label: "Risk / blocker", kind: "topic", hits: 1 },
  ],
  src_support: [{ id: "t1", label: "Billing", kind: "keyword", hits: 2 }],
};

export const HIGHLIGHTS: Record<string, Highlight[]> = {
  src_standup: [
    { id: "h1", kind: "decision", segmentId: "s4", text: "Go/no-go scheduled for 15:00." },
    { id: "h2", kind: "objection", segmentId: "s5", text: "Pricing page still pending (risk)." },
    { id: "h3", kind: "action", segmentId: "s6", text: "Pricing page to land by 14:00." },
  ],
  src_sales: [
    { id: "h1", kind: "objection", segmentId: "c1", text: "Price feels high." },
    { id: "h2", kind: "question", segmentId: "c3", text: "Can we start next month?" },
    { id: "h3", kind: "action", segmentId: "c4", text: "Send proposal today." },
  ],
  src_support: [{ id: "h1", kind: "question", segmentId: "p1", text: "Monthly vs annual billing?" }],
};

/** Live coaching cues (whisper) — surfaced to managers only (RBAC). */
export const COACHING: Record<string, CoachingCue[]> = {
  src_sales: [
    { id: "cc1", kind: "warning", text: "Price objection raised — acknowledge before countering.", tSec: 10 },
    { id: "cc2", kind: "tip", text: "Mention included onboarding to add value.", tSec: 28 },
    { id: "cc3", kind: "praise", text: "Strong close — buying signal captured.", tSec: 96 },
  ],
  src_standup: [],
  src_support: [],
};

/** Extra segments streamed in when a source is "live". */
export const LIVE_FEED: Record<
  string,
  { seg: TranscriptSegment; point: SentimentPoint; cue?: CoachingCue; highlight?: Highlight }[]
> = {
  src_sales: [
    {
      seg: { id: "lc1", speakerId: "ext_jordan", speakerName: "Jordan (Acme)", startSec: 130, en: "Send it over — I'll loop in procurement.", tr: "Gönder — satın almayı da dahil ederim.", sentiment: "positive" },
      point: { tSec: 130, value: 0.7 },
      cue: { id: "lcc1", kind: "praise", text: "Procurement mentioned — qualify the timeline.", tSec: 130 },
      highlight: { id: "lh1", kind: "action", segmentId: "lc1", text: "Send proposal; procurement to be looped in." },
    },
    {
      seg: { id: "lc2", speakerId: "usr_1", startSec: 160, en: "Perfect. What's your ideal go-live date?", tr: "Harika. İdeal canlıya geçiş tarihiniz nedir?", sentiment: "neutral" },
      point: { tSec: 160, value: 0.4 },
      cue: { id: "lcc2", kind: "tip", text: "Good discovery question — confirm budget next.", tSec: 160 },
      highlight: { id: "lh2", kind: "question", segmentId: "lc2", text: "Asked for ideal go-live date." },
    },
  ],
};
