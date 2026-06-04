import { useTranslation } from "react-i18next";
import { Waveform, Tag, ListChecks } from "@/lib/icons";
import { useIntelStore } from "../store";
import { TRANSCRIPTS } from "../data";
import { speakerStats, topKeywords, actionItems, type SpeakerStat } from "../notes";
import { memberName } from "@/lib/identity";
import { Card } from "@/components/ui/primitives";

/**
 * notta/otter-style meeting notes (Faz 4): speaker diarization + words-per-minute,
 * keyword extraction and auto action items, computed live from the transcript.
 */
export function MeetingNotesCard() {
  const { t } = useTranslation();
  const sourceId = useIntelStore((s) => s.activeSourceId);
  const segs = TRANSCRIPTS[sourceId] ?? [];
  if (segs.length === 0) return null;

  const stats = speakerStats(segs);
  const maxWpm = Math.max(1, ...stats.map((s) => s.wpm));
  const keywords = topKeywords(segs);
  const actions = actionItems(segs);
  const nameOf = (st: SpeakerStat) => (st.name !== st.speakerId ? st.name : memberName(st.speakerId));

  return (
    <Card>
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
        <Waveform size={18} aria-hidden /> {t("intel.notes.title")}
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <section>
          <h4 className="mb-1 text-base font-semibold text-muted">{t("intel.notes.wpm")}</h4>
          <ul className="space-y-1.5">
            {stats.map((st) => (
              <li key={st.speakerId}>
                <div className="flex items-center justify-between text-base text-fg">
                  <span className="truncate">{nameOf(st)}</span>
                  <span className="text-muted">{st.wpm} {t("intel.notes.wpmUnit")}</span>
                </div>
                <div className="mt-0.5 h-1.5 w-full rounded-full bg-surface">
                  <div className="h-1.5 rounded-full bg-accent" style={{ width: `${(st.wpm / maxWpm) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="mb-1 flex items-center gap-1 text-base font-semibold text-muted">
            <Tag size={14} aria-hidden /> {t("intel.notes.keywords")}
          </h4>
          <div className="flex flex-wrap gap-1">
            {keywords.map((k) => (
              <span key={k.word} className="rounded-full border border-border px-2 py-0.5 text-base text-fg">
                {k.word} <span className="text-muted">{k.count}</span>
              </span>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-1 flex items-center gap-1 text-base font-semibold text-muted">
            <ListChecks size={14} aria-hidden /> {t("intel.notes.actions")}
          </h4>
          {actions.length > 0 ? (
            <ul className="ml-4 list-disc space-y-1 text-base text-fg">
              {actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          ) : (
            <p className="text-base text-muted">{t("intel.notes.noActions")}</p>
          )}
        </section>
      </div>
    </Card>
  );
}
