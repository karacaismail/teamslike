import * as React from "react";
import { useTranslation } from "react-i18next";
import { CurrencyDollar, Clock } from "@/lib/icons";
import { RATE_CARD, windowState, monthlyEstimate, type MessageCategory, type BillingContext } from "../messagingCost";
import { Badge, Card } from "@/components/ui/primitives";

const CATEGORIES: MessageCategory[] = ["marketing", "utility", "authentication", "service"];

/** Sample monthly traffic mix for the predictable-bill estimate. */
const SAMPLE: BillingContext[] = [
  ...Array.from({ length: 1200 }, () => ({ category: "marketing" as const, withinWindow: false })),
  ...Array.from({ length: 3000 }, () => ({ category: "utility" as const, withinWindow: false })),
  ...Array.from({ length: 800 }, () => ({ category: "authentication" as const, withinWindow: false })),
  ...Array.from({ length: 5000 }, () => ({ category: "service" as const, withinWindow: true })),
];

/** WhatsApp cost engine: rate card + 24h window + predictable monthly estimate. */
export function CostPanel() {
  const { t } = useTranslation();
  const [region, setRegion] = React.useState("TR");
  const [sinceMin, setSinceMin] = React.useState(120);
  const ws = windowState(0, sinceMin);
  const estimate = monthlyEstimate(SAMPLE, region);
  const card = RATE_CARD[region] ?? RATE_CARD.default;

  return (
    <Card>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-1 text-base font-semibold text-fg">
          <CurrencyDollar size={18} aria-hidden /> {t("support.cost.title")}
        </h3>
        <label className="ml-auto flex items-center gap-2 text-base text-muted">
          {t("support.cost.region")}
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="h-10 rounded-md border border-border bg-bg px-2 text-base text-fg">
            {Object.keys(RATE_CARD).map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
      </div>

      <table className="w-full border-collapse text-base">
        <thead>
          <tr className="text-muted">
            <th className="py-1 text-left font-medium">{t("support.cost.category")}</th>
            <th className="py-1 text-right font-medium">{t("support.cost.rate")}</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((c) => (
            <tr key={c} className="border-t border-border">
              <td className="py-1 text-fg">{t(`support.cost.cat.${c}`)}</td>
              <td className="py-1 text-right tabular-nums text-fg">{card[c] === 0 ? t("support.cost.free") : `$${card[c].toFixed(4)}`}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-base">
        <Clock size={16} className="text-muted" aria-hidden />
        <span className="text-fg">{t("support.cost.window")}</span>
        <input
          type="range"
          min={0}
          max={1500}
          value={sinceMin}
          onChange={(e) => setSinceMin(Number(e.target.value))}
          aria-label={t("support.cost.window")}
          className="flex-1"
        />
        <Badge tone={ws.open ? "positive" : "danger"}>
          {ws.open ? t("support.cost.windowOpen", { n: Math.round(ws.remainingMin / 60) }) : t("support.cost.windowClosed")}
        </Badge>
      </div>

      <p className="mt-2 text-base text-muted">
        {t("support.cost.estimate", { total: estimate.toFixed(2), n: SAMPLE.length })}
      </p>
    </Card>
  );
}
