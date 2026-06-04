import { useTranslation } from "react-i18next";
import { useCallStore } from "../callStore";
import { usePbxStore } from "../pbxStore";
import { computeCallStats, volumeByHour } from "../analytics";
import { fmtDuration } from "./CallStateChip";
import { Card, StatCard } from "@/components/ui/primitives";

export function CallAnalytics() {
  const { t } = useTranslation();
  const history = useCallStore((s) => s.history);
  const queues = usePbxStore((s) => s.queues);
  const stats = computeCallStats(history);
  const buckets = volumeByHour(history);
  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("phone.analytics.total")} value={String(stats.total)} />
        <StatCard label={t("phone.analytics.missedRate")} value={`${Math.round(stats.missedRate * 100)}%`} />
        <StatCard label={t("phone.analytics.avgHandle")} value={fmtDuration(stats.avgHandleSec)} />
        <StatCard label={t("phone.analytics.recorded")} value={String(stats.recorded)} />
      </div>

      <Card>
        <h3 className="mb-3 text-base font-semibold text-fg">{t("phone.analytics.volume")}</h3>
        <div className="flex h-32 items-end gap-0.5" role="img" aria-label={t("phone.analytics.volume")}>
          {buckets.map((b) => (
            <div key={b.hour} className="flex flex-1 flex-col items-center justify-end">
              <div
                className="w-full rounded-t-sm bg-accent"
                style={{ height: `${(b.count / max) * 100}%`, minHeight: b.count ? "4px" : "0" }}
                title={`${b.hour}:00 · ${b.count}`}
              />
              {b.hour % 6 === 0 ? <span className="mt-1 text-base text-muted">{b.hour}</span> : null}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 text-base font-semibold text-fg">{t("phone.analytics.queueSla")}</h3>
        <ul className="space-y-1.5">
          {queues.map((q) => (
            <li key={q.id} className="flex items-center gap-2 text-base">
              <span className="flex-1 text-fg">{q.name}</span>
              <span className="text-muted">{t("phone.analytics.waiting", { n: q.waiting.length })}</span>
              <span className="text-muted">· {t("phone.analytics.maxWait", { s: q.maxWaitSec })}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
