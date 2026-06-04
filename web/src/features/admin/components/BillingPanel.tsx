import * as React from "react";
import { useTranslation } from "react-i18next";
import { Receipt, Sparkle } from "@/lib/icons";
import { useAdminStore } from "../adminStore";
import { aiCreditState, creditOverage } from "../admin";
import { Badge, Card } from "@/components/ui/primitives";
import { ConfirmAction } from "./ConfirmAction";
import type { Plan } from "../types";

const PLANS: Plan[] = ["free", "pro", "business", "enterprise"];

export function BillingPanel() {
  const { t } = useTranslation();
  const billing = useAdminStore((s) => s.billing);
  const invoices = useAdminStore((s) => s.invoices);
  const upgradePlan = useAdminStore((s) => s.upgradePlan);
  const [target, setTarget] = React.useState<Plan>("enterprise");

  return (
    <div className="space-y-3">
      <Card>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-fg">{t("admin.billing")}</h3>
          <Badge tone="accent">{t(`admin.planName.${billing.plan}`)}</Badge>
          <span className="text-base text-muted">{t("admin.seats", { n: billing.seats })}</span>
        </div>
        <p className="mb-2 text-base text-muted">{t("admin.paymentNote")}</p>

        <div className="mb-3 rounded-md border border-border p-3">
          <div className="mb-1 flex items-center gap-2 text-base">
            <Sparkle size={16} className="text-muted" aria-hidden />
            <span className="flex-1 font-medium text-fg">{t("admin.aiCredits.title")}</span>
            {(() => {
              const lvl = aiCreditState(billing.aiCreditsUsed, billing.aiCreditsIncluded);
              return <Badge tone={lvl === "exceeded" ? "danger" : lvl === "warn" ? "warning" : "positive"}>{billing.aiCreditsUsed}/{billing.aiCreditsIncluded}</Badge>;
            })()}
          </div>
          <p className="text-base text-muted">
            {t("admin.aiCredits.rate", { cost: billing.perCreditCost.toFixed(2) })}
            {" · "}
            {t("admin.aiCredits.overage", { cost: creditOverage(billing.aiCreditsUsed, billing.aiCreditsIncluded, billing.perCreditCost).toFixed(2) })}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-base text-muted">
            {t("admin.changePlan")}
            <select value={target} onChange={(e) => setTarget(e.target.value as Plan)} className="h-11 rounded-md border border-border bg-bg px-2 text-base text-fg">
              {PLANS.map((p) => <option key={p} value={p}>{t(`admin.planName.${p}`)}</option>)}
            </select>
          </label>
          <ConfirmAction
            label={t("admin.upgrade")}
            verifyWord={target.toUpperCase()}
            variant="primary"
            onConfirm={() => upgradePlan(target)}
          />
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
          <Receipt size={16} aria-hidden /> {t("admin.invoices")}
        </h3>
        {invoices.map((inv) => (
          <div key={inv.id} className="mb-2 rounded-md border border-border p-3">
            <div className="mb-1 text-base font-medium text-fg">{inv.period}</div>
            <ul className="space-y-0.5">
              {inv.lines.map((l) => (
                <li key={l.label} className="flex justify-between text-base text-muted">
                  <span>{l.label}</span>
                  <span>${l.amount}</span>
                </li>
              ))}
            </ul>
            <div className="mt-1 flex justify-between border-t border-border pt-1 text-base font-semibold text-fg">
              <span>{t("admin.total")}</span>
              <span>${inv.total}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
