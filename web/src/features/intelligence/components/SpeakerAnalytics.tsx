import { useTranslation } from "react-i18next";
import { useIntelStore } from "../store";
import { SPEAKER_STATS } from "../data";
import { memberName } from "@/lib/identity";
import { Card } from "@/components/ui/primitives";
import { SentimentChip, sentimentFromValue, fmtClock } from "./SentimentChip";

/** Per-speaker talk-time, sentiment, interruptions and filler words (Dialpad/Zoom). */
export function SpeakerAnalytics() {
  const { t } = useTranslation();
  const id = useIntelStore((s) => s.activeSourceId);
  const stats = SPEAKER_STATS[id] ?? [];
  const total = stats.reduce((n, s) => n + s.talkSec, 0) || 1;

  return (
    <Card>
      <h3 className="mb-2 text-base font-semibold text-fg">{t("intel.speakers")}</h3>
      <ul className="space-y-3">
        {stats.map((s) => {
          const pct = Math.round((s.talkSec / total) * 100);
          return (
            <li key={s.speakerId}>
              <div className="flex items-center justify-between text-base">
                <span className="font-medium text-fg">{s.name ?? memberName(s.speakerId)}</span>
                <span className="text-muted">{pct}% · {fmtClock(s.talkSec)}</span>
              </div>
              <div className="my-1 h-2 w-full overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-base text-muted">
                <SentimentChip sentiment={sentimentFromValue(s.sentiment)} />
                <span>{t("intel.interruptions", { n: s.interruptions })}</span>
                <span>{t("intel.filler", { n: s.fillerWords })}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
