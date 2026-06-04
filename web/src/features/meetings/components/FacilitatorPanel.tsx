import * as React from "react";
import { useTranslation } from "react-i18next";
import { Sparkle, Clock, ListChecks, Minus, Plus, BookmarkSimple } from "@/lib/icons";
import { useMeetingStore } from "../store";
import { buildAgenda, agendaProgress, agendaTotal, extractActionItems, meetingChapters } from "../facilitator";
import { Badge, IconButton } from "@/components/ui/primitives";

/** AI Facilitator (Teams parity): timed agenda, timekeeper, action-item mining. */
export function FacilitatorPanel() {
  const { t } = useTranslation();
  const captions = useMeetingStore((s) => s.captions);
  const [elapsedMin, setElapsedMin] = React.useState(0);

  const agenda = buildAgenda([
    { title: t("meetings.facilitator.items.intro"), minutes: 5 },
    { title: t("meetings.facilitator.items.demo"), minutes: 15 },
    { title: t("meetings.facilitator.items.qa"), minutes: 10 },
  ]);
  const total = agendaTotal(agenda);
  const prog = agendaProgress(agenda, elapsedMin);
  const lines = captions.map((c) => ({ speaker: c.speaker, text: c.text }));
  const actions = extractActionItems(lines);
  const chapters = meetingChapters(lines);

  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-1 text-base font-semibold text-muted">
        <Sparkle size={16} aria-hidden /> {t("meetings.facilitator.title")}
      </h3>

      <div className="rounded-md border border-border px-3 py-2">
        <div className="flex items-center gap-2 text-base">
          <Clock size={16} className="text-muted" aria-hidden />
          <span className="flex-1 text-fg">
            {prog.current ? prog.current.title : t("meetings.facilitator.noAgenda")}
          </span>
          <IconButton label={t("meetings.facilitator.back")} onClick={() => setElapsedMin((m) => Math.max(0, m - 5))}>
            <Minus size={16} aria-hidden />
          </IconButton>
          <span className="tabular-nums text-muted" aria-live="polite">{elapsedMin}/{total} {t("meetings.facilitator.min")}</span>
          <IconButton label={t("meetings.facilitator.fwd")} onClick={() => setElapsedMin((m) => m + 5)}>
            <Plus size={16} aria-hidden />
          </IconButton>
        </div>
        {prog.done ? (
          <Badge tone={prog.overrunMin > 0 ? "warning" : "positive"}>
            {prog.overrunMin > 0 ? t("meetings.facilitator.overrun", { n: prog.overrunMin }) : t("meetings.facilitator.onTime")}
          </Badge>
        ) : null}
      </div>

      <div className="rounded-md border border-border px-3 py-2">
        <div className="mb-1 flex items-center gap-1 text-base text-muted">
          <ListChecks size={16} aria-hidden /> {t("meetings.facilitator.actionItems", { n: actions.length })}
        </div>
        {actions.length === 0 ? (
          <p className="text-base text-muted">{t("meetings.facilitator.noActions")}</p>
        ) : (
          <ul className="space-y-1">
            {actions.map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-base text-fg">
                <Badge tone="accent">{a.owner}</Badge>
                <span className="min-w-0 flex-1 truncate">{a.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-border px-3 py-2">
        <div className="mb-1 flex items-center gap-1 text-base text-muted">
          <BookmarkSimple size={16} aria-hidden /> {t("meetings.facilitator.chapters", { n: chapters.length })}
        </div>
        {chapters.length === 0 ? (
          <p className="text-base text-muted">{t("meetings.facilitator.noChapters")}</p>
        ) : (
          <ol className="space-y-1">
            {chapters.map((c) => (
              <li key={c.index} className="flex items-center gap-2 text-base text-fg">
                <span className="tabular-nums text-muted">{c.index + 1}.</span>
                <span className="min-w-0 flex-1 truncate">{c.title}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
