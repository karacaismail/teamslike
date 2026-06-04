import { useTranslation } from "react-i18next";
import { CheckCircle, Warning, XCircle } from "@/lib/icons";
import { useAdminStore } from "../adminStore";
import { quotaState, type QuotaLevel } from "../admin";
import { Badge, Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

const LEVEL: Record<QuotaLevel, { Icon: typeof CheckCircle; tone: "positive" | "warning" | "danger"; cls: string }> = {
  ok: { Icon: CheckCircle, tone: "positive", cls: "bg-positive" },
  warn: { Icon: Warning, tone: "warning", cls: "bg-warning" },
  exceeded: { Icon: XCircle, tone: "danger", cls: "bg-danger" },
};

export function OverviewDashboard() {
  const { t } = useTranslation();
  const quotas = useAdminStore((s) => s.quotas);
  const billing = useAdminStore((s) => s.billing);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-3">
        <span className="text-base text-muted">{t("admin.plan")}</span>
        <Badge tone="accent">{t(`admin.planName.${billing.plan}`)}</Badge>
        <span className="text-base text-muted">{t("admin.seats", { n: billing.seats })}</span>
        <Badge tone="positive">{t(`admin.billingStatus.${billing.status}`)}</Badge>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {quotas.map((q) => {
          const level = quotaState(q.used, q.limit);
          const { Icon, tone, cls } = LEVEL[level];
          const pct = q.limit > 0 ? Math.round((q.used / q.limit) * 100) : 0;
          return (
            <Card key={q.key} className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex-1 text-base font-medium text-fg">{q.key}</span>
                <Badge tone={tone}><Icon size={12} aria-hidden /> {t(`admin.quota.${level}`)}</Badge>
              </div>
              <div className="text-base text-muted">{q.used} / {q.limit}</div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface">
                <div className={cn("h-full", cls)} style={{ width: `${Math.min(100, pct)}%` }} aria-hidden />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
