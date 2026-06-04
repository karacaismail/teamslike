import * as React from "react";
import { useTranslation } from "react-i18next";
import { Plus, ArrowRight } from "@/lib/icons";
import { ROUTING_RULES, LINES } from "../data";
import { evaluateRouting, formatNumber } from "../routing";
import { Badge, Button, Card } from "@/components/ui/primitives";
import type { RoutingActionKind, RoutingCondition, RoutingRule } from "../types";

const CONDITIONS: RoutingCondition[] = ["always", "afterHours", "busy", "noAnswer"];
const ACTIONS: RoutingActionKind[] = ["forward", "voicemail", "ivr"];

export function RoutingRuleBuilder() {
  const { t } = useTranslation();
  const [rules, setRules] = React.useState<RoutingRule[]>(() => ROUTING_RULES.map((r) => ({ ...r })));
  const [condition, setCondition] = React.useState<RoutingCondition>("afterHours");
  const [action, setAction] = React.useState<RoutingActionKind>("voicemail");
  const [target, setTarget] = React.useState("");

  // Live preview of which rule fires under a chosen context.
  const [ctx, setCtx] = React.useState({ afterHours: false, busy: false, noAnswer: false });
  const fired = evaluateRouting(rules, ctx);

  const add = () => {
    setRules((rs) => [
      { id: `rr_${Date.now()}`, lineId: LINES[0].id, condition, action, target: target || undefined },
      ...rs.filter((r) => r.condition !== "always"),
      ...rs.filter((r) => r.condition === "always"),
    ]);
    setTarget("");
  };

  const needsTarget = action === "forward" || action === "ivr";

  return (
    <Card>
      <h3 className="mb-3 text-base font-semibold text-fg">{t("phone.routing.title")}</h3>

      <ul className="mb-4 space-y-1.5">
        {rules.map((r) => (
          <li key={r.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-base">
            <span className="text-muted">{t("phone.routing.when")}</span>
            <span className="font-medium text-fg">{t(`phone.routing.condition.${r.condition}`)}</span>
            <ArrowRight size={14} className="text-muted" aria-hidden />
            <span className="text-muted">{t("phone.routing.then")}</span>
            <Badge tone="accent">{t(`phone.routing.action.${r.action}`)}</Badge>
            {r.target ? <span className="truncate text-muted">{formatNumber(r.target)}</span> : null}
          </li>
        ))}
      </ul>

      {/* Add rule */}
      <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
        <label className="flex flex-col gap-1 text-base text-muted">
          {t("phone.routing.when")}
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as RoutingCondition)}
            className="h-11 rounded-md border border-border bg-bg px-2 text-base text-fg"
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{t(`phone.routing.condition.${c}`)}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-base text-muted">
          {t("phone.routing.then")}
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as RoutingActionKind)}
            className="h-11 rounded-md border border-border bg-bg px-2 text-base text-fg"
          >
            {ACTIONS.map((a) => (
              <option key={a} value={a}>{t(`phone.routing.action.${a}`)}</option>
            ))}
          </select>
        </label>
        {needsTarget ? (
          <label className="flex flex-col gap-1 text-base text-muted">
            {t("phone.routing.target")}
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="+1…"
              className="h-11 w-40 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none"
            />
          </label>
        ) : null}
        <Button onClick={add}>
          <Plus size={16} aria-hidden /> {t("phone.routing.addRule")}
        </Button>
      </div>

      {/* Preview */}
      <div className="mt-4 rounded-md border border-border bg-surface p-3">
        <div className="mb-2 flex flex-wrap gap-3 text-base text-fg">
          {(["afterHours", "busy", "noAnswer"] as const).map((k) => (
            <label key={k} className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={ctx[k]}
                onChange={(e) => setCtx((c) => ({ ...c, [k]: e.target.checked }))}
                className="h-4 w-4"
              />
              {t(`phone.routing.condition.${k}`)}
            </label>
          ))}
        </div>
        <div className="text-base text-muted">
          {t("phone.routing.preview")}:{" "}
          {fired ? (
            <span className="font-medium text-fg">
              {t(`phone.routing.action.${fired.action}`)}
              {fired.target ? ` → ${formatNumber(fired.target)}` : ""}
            </span>
          ) : (
            "—"
          )}
        </div>
      </div>
    </Card>
  );
}
