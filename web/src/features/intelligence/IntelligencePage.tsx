import * as React from "react";
import { Forbidden } from "@/components/ui/Forbidden";
import { useTranslation } from "react-i18next";
import { Translate, Broadcast, Sparkle, ListChecks, Prohibit, LockKey, SpeakerHigh, DownloadSimple, EyeSlash } from "@/lib/icons";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { useAskCopilot } from "@/lib/useCopilot";
import { useUrlSelection } from "@/lib/useUrlSelection";
import { useIntelStore } from "./store";
import { subscribeIntel } from "./stream";
import { SOURCES, LANGS, RECAPS } from "./data";
import { downloadText } from "@/lib/download";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { TranscriptViewer } from "./components/TranscriptViewer";
import { TranslationSessionPanel } from "./components/TranslationSessionPanel";
import { SentimentTimeline } from "./components/SentimentTimeline";
import { Scorecard } from "./components/Scorecard";
import { IntentList } from "./components/IntentList";
import { HighlightReel } from "./components/HighlightReel";
import { CoachingPanel } from "./components/CoachingPanel";
import { RecapPanel } from "./components/RecapPanel";
import { MeetingNotesCard } from "./components/MeetingNotesCard";
import { SpeakerAnalytics } from "./components/SpeakerAnalytics";
import { RubricCard } from "./components/RubricCard";
import { TrackersCard } from "./components/TrackersCard";
import { cn } from "@/lib/cn";

export function IntelligencePage() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.can);
  const ask = useAskCopilot();
  const push = useToastStore((s) => s.push);
  const { activeSourceId, setSource, targetLang, setTargetLang, live, toggleLive, dub, toggleDub, redact, toggleRedact } = useIntelStore();
  const coachingLen = useIntelStore((s) => s.coaching.length);
  const source = SOURCES.find((x) => x.id === activeSourceId);
  // Deep-link the active source (?source=) — shareable + reload-safe (J2).
  useUrlSelection("source", activeSourceId, setSource, (id) => SOURCES.some((s) => s.id === id));

  // Live mode subscribes to the mock SSE stream; each typed event is applied
  // through the store's single `applyEvent` path (idempotent). Swapping
  // `subscribeIntel` for an `EventSource` is the only backend change needed.
  React.useEffect(() => {
    if (!live) return;
    return subscribeIntel(
      activeSourceId,
      (e) => useIntelStore.getState().applyEvent(e),
      { intervalMs: 2600, onComplete: () => useIntelStore.setState({ live: false }) },
    );
  }, [live, activeSourceId]);

  // CoachingCueRaised → live whisper toast (managers only).
  const prevCoaching = React.useRef(coachingLen);
  React.useEffect(() => {
    if (coachingLen > prevCoaching.current && live && can("admin.access")) {
      const last = useIntelStore.getState().coaching.at(-1);
      if (last) {
        push({
          title: t("intel.coachingTriggered"),
          description: last.text,
          tone: last.kind === "warning" ? "danger" : "positive",
        });
      }
    }
    prevCoaching.current = coachingLen;
  }, [coachingLen, live, can, push, t]);

  if (!can("intelligence.view")) {
    return <Forbidden />;
  }

  const ctx = source?.title ?? "";

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-fg">{t("nav.intelligence")}</h1>
          <p className="mt-1 text-base text-muted">{t("intel.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => ask(t("intel.ai.summarize"), ctx)}>
            <Sparkle size={18} aria-hidden /> {t("intel.summarize")}
          </Button>
          <Button variant="secondary" onClick={() => ask(t("intel.ai.actions"), ctx)}>
            <ListChecks size={18} aria-hidden /> {t("intel.actionItems")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              const r = RECAPS[activeSourceId];
              const parts = [
                `# ${source?.title ?? activeSourceId}`,
                r?.tldr ? `\nTL;DR: ${r.tldr}` : "",
                r?.decisions?.length ? `\nDecisions:\n${r.decisions.map((d) => `- ${d}`).join("\n")}` : "",
                r?.nextSteps?.length ? `\nNext steps:\n${r.nextSteps.map((s) => `- ${s}`).join("\n")}` : "",
                r?.actions?.length ? `\nAction items:\n${r.actions.map((a) => `- ${a.text}`).join("\n")}` : "",
              ];
              downloadText(`${activeSourceId}-recap.md`, parts.filter(Boolean).join("\n") || (source?.title ?? "recap"), "text/markdown");
              push({ title: t("intel.exported"), tone: "positive" });
            }}
          >
            <DownloadSimple size={18} aria-hidden /> {t("intel.export")}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-raised p-3">
        <label className="flex items-center gap-2 text-base text-muted">
          {t("intel.source")}
          <select
            value={activeSourceId}
            onChange={(e) => setSource(e.target.value)}
            className="h-11 rounded-md border border-border bg-bg px-2 text-base text-fg"
          >
            {SOURCES.map((sx) => (
              <option key={sx.id} value={sx.id}>
                {sx.title} · {t(`intel.kindLabel.${sx.kind}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-base text-muted">
          <Translate size={16} aria-hidden /> {t("intel.translateTo")}
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="h-11 rounded-md border border-border bg-bg px-2 text-base text-fg"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.code === "off" ? t("intel.translateOff") : l.label}
              </option>
            ))}
          </select>
        </label>

        {targetLang !== "off" && targetLang !== "en" ? (
          <Badge tone="positive">
            <LockKey size={14} aria-hidden /> {t("intel.voicePreserving")}
          </Badge>
        ) : null}

        {targetLang !== "off" ? (
          <button
            onClick={toggleDub}
            aria-pressed={dub}
            className={cn(
              "inline-flex h-11 items-center gap-1 rounded-md border px-3 text-base",
              dub ? "border-accent bg-surface text-accent" : "border-border bg-surface text-muted hover:bg-raised",
            )}
          >
            <SpeakerHigh size={16} aria-hidden /> {t("intel.listenInLang")}
          </button>
        ) : null}

        <button
          onClick={toggleRedact}
          aria-pressed={redact}
          className={cn(
            "ml-auto inline-flex h-11 items-center gap-1 rounded-md border px-3 text-base",
            redact ? "border-accent bg-surface text-accent" : "border-border bg-surface text-muted hover:bg-raised",
          )}
        >
          <EyeSlash size={16} aria-hidden /> {t("intel.redact")}
        </button>

        <button
          onClick={toggleLive}
          aria-pressed={live}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-md border px-3 text-base",
            live ? "border-danger bg-danger text-white" : "border-border bg-surface text-fg hover:bg-raised",
          )}
        >
          <Broadcast size={18} aria-hidden />
          {live ? t("intel.liveOn") : t("intel.goLive")}
        </button>
      </div>

      <TranslationSessionPanel />
      <CoachingPanel />
      <RecapPanel />
      <MeetingNotesCard />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-[62vh] lg:col-span-2">
          <TranscriptViewer />
        </div>
        <div className="space-y-4">
          <Scorecard />
          <RubricCard />
          <SpeakerAnalytics />
          <SentimentTimeline />
          <IntentList />
          <TrackersCard />
          <HighlightReel />
        </div>
      </div>
    </div>
  );
}
