import * as React from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlass, SpeakerHigh } from "@/lib/icons";
import { useIntelStore } from "../store";
import { SOURCES, LANGS } from "../data";
import { segmentText } from "../segments";
import type { TranscriptSegment } from "../types";
import { memberName } from "@/lib/identity";
import { Avatar } from "@/components/ui/Avatar";
import { SentimentChip, fmtClock } from "./SentimentChip";

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Mask emails and long digit runs (PII redaction / compliance). */
function redactText(text: string) {
  return text.replace(/[\w.+-]+@[\w.-]+\.\w+/g, "•••@•••").replace(/\b\d{4,}\b/g, "••••");
}

function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRe(q)})`, "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded-sm bg-warning px-0.5 text-bg">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function TranscriptViewer() {
  const { t } = useTranslation();
  const { segments, targetLang, search, setSearch, speakerFilter, setSpeakerFilter, dub, redact, activeSourceId } =
    useIntelStore();
  const endRef = React.useRef<HTMLDivElement>(null);

  const source = SOURCES.find((s) => s.id === activeSourceId);
  const dubLang = LANGS.find((l) => l.code === targetLang)?.label ?? targetLang;

  const speakers = Array.from(new Set(segments.map((s) => s.speakerId)));
  const q = search.trim().toLowerCase();
  const filtered = segments
    .filter((s) => !speakerFilter || s.speakerId === speakerFilter)
    .filter(
      (s) =>
        q === "" ||
        s.en.toLowerCase().includes(q) ||
        s.tr.toLowerCase().includes(q) ||
        Object.values(s.translations ?? {}).some((v) => v.toLowerCase().includes(q)),
    );

  React.useEffect(() => {
    const el = endRef.current;
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "end" });
  }, [segments.length]);

  const translate = (seg: TranscriptSegment) => segmentText(seg, targetLang);

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-raised">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <span className="text-base font-semibold text-fg">{t("intel.transcript")}</span>
        <span className="rounded-sm border border-border px-1.5 text-base text-muted">
          {t("intel.detected")}: {source?.language?.toUpperCase() ?? "EN"}
        </span>
        <div className="relative ml-auto">
          <MagnifyingGlass size={14} aria-hidden className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("intel.searchTranscript")}
            aria-label={t("intel.searchTranscript")}
            className="h-9 w-40 rounded-md border border-border bg-bg pl-7 pr-2 text-base text-fg outline-none placeholder:text-muted"
          />
        </div>
        <select
          value={speakerFilter ?? ""}
          onChange={(e) => setSpeakerFilter(e.target.value || null)}
          aria-label={t("intel.speakerFilter")}
          className="h-9 rounded-md border border-border bg-bg px-2 text-base text-fg"
        >
          <option value="">{t("intel.allSpeakers")}</option>
          {speakers.map((sp) => {
            const seg = segments.find((s) => s.speakerId === sp);
            return (
              <option key={sp} value={sp}>
                {seg?.speakerName ?? memberName(sp)}
              </option>
            );
          })}
        </select>
      </div>

      {dub ? (
        <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-1.5 text-base text-accent" aria-live="polite">
          <SpeakerHigh size={16} aria-hidden /> {t("intel.dubbing", { lang: dubLang })}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {filtered.length === 0 ? (
          <p className="text-base text-muted">{t("intel.noMatches")}</p>
        ) : (
          filtered.map((seg) => (
            <div key={seg.id} id={`seg-${seg.id}`} className="flex gap-3">
              <Avatar name={seg.speakerName ?? memberName(seg.speakerId)} size={32} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-fg">{seg.speakerName ?? memberName(seg.speakerId)}</span>
                  <span className="text-base text-muted">{fmtClock(seg.startSec)}</span>
                  <SentimentChip sentiment={seg.sentiment} />
                </div>
                <div className="text-base text-fg">
                  {highlight(redact ? redactText(seg.en) : seg.en, search.trim())}
                </div>
                {targetLang !== "off" ? (
                  <div className="mt-0.5 rounded-md border-l-2 border-accent bg-surface px-2 py-1 text-base text-fg">
                    {redact ? redactText(translate(seg)) : translate(seg)}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
