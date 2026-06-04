import * as React from "react";
import { useTranslation } from "react-i18next";
import { ChartLineUp, ClipboardText, Gauge, Plus, ArrowsClockwise, Lightning } from "@/lib/icons";
import { useWfoStore } from "../wfoStore";
import { adherence as adherenceRatio, scorecardTotal, staffingGap, understaffed } from "../wfo";
import { AGENTS } from "../data";
import { Badge, Button, Card, IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

const agentName = (id: string) => AGENTS.find((a) => a.id === id)?.name ?? id;

export function WorkforcePanel() {
  const { t } = useTranslation();
  const intervals = useWfoStore((s) => s.intervals);
  const adherenceRows = useWfoStore((s) => s.adherence);
  const criteria = useWfoStore((s) => s.criteria);
  const evaluations = useWfoStore((s) => s.evaluations);
  const setVolume = useWfoStore((s) => s.setVolume);
  const bumpScheduled = useWfoStore((s) => s.bumpScheduled);
  const regenerate = useWfoStore((s) => s.regenerateForecast);
  const addEvaluation = useWfoStore((s) => s.addEvaluation);

  const gaps = understaffed(intervals);

  const [agentId, setAgentId] = React.useState(AGENTS[0]?.id ?? "");
  const [scores, setScores] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(criteria.map((c) => [c.id, 3])),
  );
  const liveTotal = scorecardTotal(scores, criteria);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Forecast & staffing */}
      <Card className="lg:col-span-2">
        <div className="mb-3 flex items-center gap-2">
          <ChartLineUp size={20} className="text-accent" aria-hidden />
          <h2 className="text-lg font-semibold text-fg">{t("support.wfo.forecast")}</h2>
          {gaps.length > 0 ? (
            <Badge tone="warning" className="ml-2">
              <Lightning size={14} aria-hidden /> {t("support.wfo.understaffed", { n: gaps.length })}
            </Badge>
          ) : null}
          <Button variant="secondary" className="ml-auto" onClick={regenerate}>
            <ArrowsClockwise size={18} aria-hidden /> {t("support.wfo.regenerate")}
          </Button>
        </div>
        <table className="w-full border-collapse text-base">
          <thead>
            <tr className="text-left text-muted">
              <th className="border-b border-border px-2 py-1 font-semibold">{t("support.wfo.interval")}</th>
              <th className="border-b border-border px-2 py-1 font-semibold">{t("support.wfo.volume")}</th>
              <th className="border-b border-border px-2 py-1 font-semibold">{t("support.wfo.required")}</th>
              <th className="border-b border-border px-2 py-1 font-semibold">{t("support.wfo.scheduled")}</th>
              <th className="border-b border-border px-2 py-1 font-semibold">{t("support.wfo.gap")}</th>
              <th className="border-b border-border px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {intervals.map((i) => {
              const gap = staffingGap(i);
              const tone = gap < 0 ? "danger" : gap === 0 ? "neutral" : "positive";
              return (
                <tr key={i.id}>
                  <td className="border-b border-border px-2 py-1 text-fg">{i.label}</td>
                  <td className="border-b border-border px-2 py-1">
                    <input
                      type="number"
                      min={0}
                      value={i.forecastVolume}
                      onChange={(e) => setVolume(i.id, Number(e.target.value))}
                      aria-label={t("support.wfo.volume")}
                      className="h-9 w-20 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    />
                  </td>
                  <td className="border-b border-border px-2 py-1 text-fg">{i.required}</td>
                  <td className="border-b border-border px-2 py-1 text-fg">{i.scheduled}</td>
                  <td className="border-b border-border px-2 py-1">
                    <Badge tone={tone}>{gap > 0 ? `+${gap}` : gap}</Badge>
                  </td>
                  <td className="border-b border-border px-2 py-1 text-right">
                    {gap < 0 ? (
                      <Button variant="secondary" onClick={() => bumpScheduled(i.id)}>
                        <Plus size={16} aria-hidden /> {t("support.wfo.selfHeal")}
                      </Button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Adherence */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Gauge size={20} className="text-accent" aria-hidden />
          <h2 className="text-lg font-semibold text-fg">{t("support.wfo.adherence")}</h2>
        </div>
        <ul className="space-y-3">
          {adherenceRows.map((row) => {
            const pct = Math.round(adherenceRatio(row.scheduledMin, row.adherentMin) * 100);
            return (
              <li key={row.agentId}>
                <div className="mb-1 flex items-center justify-between text-base">
                  <span className="text-fg">{agentName(row.agentId)}</span>
                  <span className={cn("font-medium", pct >= 90 ? "text-positive" : pct >= 80 ? "text-warning" : "text-danger")}>
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className={cn("h-full transition-all motion-reduce:transition-none", pct >= 90 ? "bg-positive" : pct >= 80 ? "bg-warning" : "bg-danger")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Quality scorecard */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardText size={20} className="text-accent" aria-hidden />
          <h2 className="text-lg font-semibold text-fg">{t("support.wfo.quality")}</h2>
        </div>

        <div className="mb-3 space-y-2">
          <label className="block text-base font-medium text-fg" htmlFor="wfo-agent">
            {t("support.wfo.agent")}
          </label>
          <select
            id="wfo-agent"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-surface px-2 text-base text-fg"
          >
            {AGENTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {criteria.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <span className="flex-1 text-base text-fg">
                {c.label} <span className="text-muted">×{c.weight}</span>
              </span>
              <select
                value={scores[c.id] ?? 0}
                onChange={(e) => setScores((s) => ({ ...s, [c.id]: Number(e.target.value) }))}
                aria-label={c.label}
                className="h-9 rounded-md border border-border bg-surface px-2 text-base text-fg"
              >
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <Badge tone="accent">{t("support.wfo.total")}: {liveTotal}</Badge>
            <Button className="ml-auto" onClick={() => addEvaluation(agentId, "cv_1", scores)}>
              <Plus size={18} aria-hidden /> {t("support.wfo.saveScore")}
            </Button>
          </div>
        </div>

        <h3 className="mb-1 text-base font-semibold text-fg">{t("support.wfo.evaluations")}</h3>
        <ul className="space-y-1">
          {evaluations.map((ev) => (
            <li key={ev.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base">
              <span className="text-fg">{agentName(ev.agentId)}</span>
              <span className="text-muted">· {ev.conversationId}</span>
              <Badge tone="positive" className="ml-auto">
                {scorecardTotal(ev.scores, criteria)}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
