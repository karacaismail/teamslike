import * as React from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlass } from "@/lib/icons";
import { useAdminStore } from "../adminStore";
import { filterAudit, retentionExpired } from "../admin";
import { Card } from "@/components/ui/primitives";

const REGIONS = ["global", "eu", "us", "tr"] as const;

const fmt = (ms: number) => new Date(ms).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export function AuditLogViewer() {
  const { t } = useTranslation();
  const audit = useAdminStore((s) => s.audit);
  const [action, setAction] = React.useState("");
  const [actorId, setActorId] = React.useState("");
  const [retentionDays, setRetentionDays] = React.useState(90);
  const [region, setRegion] = React.useState<string>("global");
  const actors = Array.from(new Set(audit.map((e) => e.actorId)));
  const rows = filterAudit(audit, { action: action || undefined, actorId: actorId || undefined });
  // Self-serve retention: hide entries older than the in-UI slider (Calendly
  // differentiator — interactive retention window over the existing util).
  const now = Date.now();
  const visible = rows.filter((e) => !retentionExpired((now - e.at) / 86_400_000, retentionDays));
  const purged = rows.length - visible.length;

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-fg">{t("admin.audit")}</h3>
        <div className="relative ml-auto">
          <MagnifyingGlass size={14} aria-hidden className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder={t("admin.filterAction")}
            aria-label={t("admin.filterAction")}
            className="h-10 w-44 rounded-md border border-border bg-bg pl-7 pr-2 text-base text-fg outline-none placeholder:text-muted"
          />
        </div>
        <select value={actorId} onChange={(e) => setActorId(e.target.value)} aria-label={t("admin.filterActor")} className="h-10 rounded-md border border-border bg-bg px-2 text-base text-fg">
          <option value="">{t("admin.allActors")}</option>
          {actors.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <label className="inline-flex items-center gap-1 text-base text-muted">
          {t("admin.residency")}
          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label={t("admin.residency")} className="h-10 rounded-md border border-border bg-bg px-2 text-base text-fg">
            {REGIONS.map((r) => <option key={r} value={r}>{r.toUpperCase()}</option>)}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 text-base text-muted">
          {t("admin.retention")}: {retentionDays}d
          <input type="range" min={0} max={365} value={retentionDays} onChange={(e) => setRetentionDays(Number(e.target.value))} aria-label={t("admin.retention")} className="w-32" />
        </label>
        {purged > 0 ? <span className="text-base text-warning">{t("admin.purged", { n: purged })}</span> : null}
      </div>

      <table className="w-full text-left text-base">
        <thead>
          <tr className="border-b border-border text-muted">
            <th scope="col" className="py-1 pr-2 font-medium">{t("admin.col.action")}</th>
            <th scope="col" className="py-1 pr-2 font-medium">{t("admin.col.actor")}</th>
            <th scope="col" className="py-1 pr-2 font-medium">{t("admin.col.resource")}</th>
            <th scope="col" className="py-1 pr-2 font-medium">{t("admin.col.ip")}</th>
            <th scope="col" className="py-1 font-medium">{t("admin.col.time")}</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((e) => (
            <tr key={e.id} className="border-b border-border/60">
              <td className="py-1.5 pr-2 text-fg">{e.action}</td>
              <td className="py-1.5 pr-2 text-muted">{e.actorId}</td>
              <td className="py-1.5 pr-2 text-muted">{e.resource}</td>
              <td className="py-1.5 pr-2 text-muted">{e.ip ?? "—"}</td>
              <td className="py-1.5 text-muted">{fmt(e.at)}</td>
            </tr>
          ))}
          {visible.length === 0 ? (
            <tr><td colSpan={5} className="py-2 text-muted">{t("admin.noAudit")}</td></tr>
          ) : null}
        </tbody>
      </table>
    </Card>
  );
}
