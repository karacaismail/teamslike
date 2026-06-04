import * as React from "react";
import { Forbidden } from "@/components/ui/Forbidden";
import { useTranslation } from "react-i18next";
import { Prohibit, Gauge, ListMagnifyingGlass, ShieldCheck, ShareNetwork, Receipt } from "@/lib/icons";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { IconType } from "@/types/domain";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { AuditLogViewer } from "./components/AuditLogViewer";
import { SecurityPolicies } from "./components/SecurityPolicies";
import { FederationSettings } from "./components/FederationSettings";
import { BillingPanel } from "./components/BillingPanel";

type Tab = "overview" | "audit" | "security" | "federation" | "billing";
const TABS: { id: Tab; Icon: IconType }[] = [
  { id: "overview", Icon: Gauge },
  { id: "audit", Icon: ListMagnifyingGlass },
  { id: "security", Icon: ShieldCheck },
  { id: "federation", Icon: ShareNetwork },
  { id: "billing", Icon: Receipt },
];

export function AdminConsole() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.can);
  const [tab, setTab] = React.useState<Tab>("overview");

  if (!can("admin.access")) {
    return <Forbidden />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div>
        <h1 className="text-3xl font-bold text-fg">{t("nav.admin")}</h1>
        <p className="mt-1 text-base text-muted">{t("admin.subtitle")}</p>
      </div>

      <div role="tablist" aria-label={t("nav.admin")} className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map(({ id, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-t-md border-b-2 px-3 text-base",
              tab === id ? "border-accent text-accent" : "border-transparent text-muted hover:text-fg",
            )}
          >
            <Icon size={18} aria-hidden /> {t(`admin.tabs.${id}`)}
          </button>
        ))}
      </div>

      {tab === "overview" ? <OverviewDashboard /> : null}
      {tab === "audit" ? <AuditLogViewer /> : null}
      {tab === "security" ? <SecurityPolicies /> : null}
      {tab === "federation" ? <FederationSettings /> : null}
      {tab === "billing" ? <BillingPanel /> : null}
    </div>
  );
}
