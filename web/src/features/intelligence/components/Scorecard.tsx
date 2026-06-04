import { useTranslation } from "react-i18next";
import { Star, Sparkle } from "@/lib/icons";
import { useIntelStore } from "../store";
import { SCORECARDS } from "../data";
import { Card } from "@/components/ui/primitives";
import { SentimentChip, sentimentFromValue, fmtClock } from "./SentimentChip";

/** Dialpad-style AI scorecard. */
export function Scorecard() {
  const { t } = useTranslation();
  const id = useIntelStore((s) => s.activeSourceId);
  const sc = SCORECARDS[id];
  if (!sc) return null;

  return (
    <Card>
      <h3 className="mb-2 text-base font-semibold text-fg">{t("intel.scorecard")}</h3>
      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-base text-muted">{t("intel.talkRatio")}</dt>
          <dd className="text-xl font-semibold text-fg">{sc.talkRatio}%</dd>
        </div>
        <div>
          <dt className="text-base text-muted">{t("intel.sentimentAvg")}</dt>
          <dd className="text-xl font-semibold">
            <SentimentChip sentiment={sentimentFromValue(sc.sentiment)} />
          </dd>
        </div>
        <div>
          <dt className="text-base text-muted">{t("intel.questions")}</dt>
          <dd className="text-xl font-semibold text-fg">{sc.questions}</dd>
        </div>
        <div>
          <dt className="text-base text-muted">{t("intel.pace")}</dt>
          <dd className="text-xl font-semibold text-fg">{sc.pace} {t("intel.wpm")}</dd>
        </div>
        <div>
          <dt className="text-base text-muted">{t("intel.monologue")}</dt>
          <dd className="text-xl font-semibold text-fg">{fmtClock(sc.monologueSec)}</dd>
        </div>
        {sc.csat ? (
          <div>
            <dt className="text-base text-muted">{t("intel.csat")}</dt>
            <dd className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((nn) => (
                <Star key={nn} size={16} weight={nn <= sc.csat! ? "fill" : "regular"} className={nn <= sc.csat! ? "text-warning" : "text-muted"} aria-hidden />
              ))}
            </dd>
          </div>
        ) : null}
      </dl>

      {sc.predictedCsat ? (
        <div className="mt-3 rounded-md border border-border bg-surface p-2">
          <div className="flex items-center gap-1 text-base font-semibold text-fg">
            <Sparkle size={14} weight="fill" className="text-accent" aria-hidden />
            {t("intel.predictedCsat")}
            <span className="ml-auto flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((nn) => (
                <Star key={nn} size={14} weight={nn <= sc.predictedCsat! ? "fill" : "regular"} className={nn <= sc.predictedCsat! ? "text-warning" : "text-muted"} aria-hidden />
              ))}
            </span>
          </div>
          {sc.csatReason ? <p className="mt-1 text-base text-muted">{sc.csatReason}</p> : null}
        </div>
      ) : null}
    </Card>
  );
}

