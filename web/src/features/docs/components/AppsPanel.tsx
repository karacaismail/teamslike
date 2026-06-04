import * as React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, ClipboardText, CalendarBlank, ChartBar, HandGrabbing, Plus } from "@/lib/icons";
import { useWorkhubStore, WORKHUB_SELF_ID } from "../workhubStore";
import { approvalSummary, weeklyHours, openShifts, tallyResponses, hasShiftConflict } from "../workhub";
import { Badge, Button, Card, IconButton } from "@/components/ui/primitives";

const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** Teams "apps" hub: Approvals · Shifts · Forms — all in one tab. */
export function AppsPanel() {
  const { t } = useTranslation();
  const s = useWorkhubStore();
  const [reqTitle, setReqTitle] = React.useState("");
  const submitRequest = () => {
    if (!reqTitle.trim()) return;
    s.requestApproval(reqTitle.trim());
    setReqTitle("");
  };
  const sum = approvalSummary(s.approvals);
  const myHours = weeklyHours(s.shifts, WORKHUB_SELF_ID);
  const conflict = hasShiftConflict(s.shifts, WORKHUB_SELF_ID);
  const open = openShifts(s.shifts);
  const days = t("docs.apps.days", { returnObjects: true }) as string[];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Approvals */}
      <Card>
        <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
          <ClipboardText size={18} aria-hidden /> {t("docs.apps.approvals")}
        </h3>
        <div className="mb-2 flex gap-2 text-base">
          <Badge tone="warning">{t("docs.apps.pending", { n: sum.pending })}</Badge>
          <Badge tone="positive">{sum.approved}</Badge>
          <Badge tone="danger">{sum.rejected}</Badge>
        </div>
        <div className="mb-2 flex items-center gap-1">
          <input
            value={reqTitle}
            onChange={(e) => setReqTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submitRequest(); }}
            placeholder={t("docs.apps.requestPh")}
            aria-label={t("docs.apps.request")}
            className="h-9 flex-1 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none placeholder:text-muted"
          />
          <IconButton label={t("docs.apps.request")} onClick={submitRequest}>
            <Plus size={16} aria-hidden />
          </IconButton>
        </div>
        <ul className="space-y-1">
          {s.approvals.map((a) => (
            <li key={a.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base">
              <span className="min-w-0 flex-1 truncate text-fg">{a.title}</span>
              {a.status === "pending" ? (
                <>
                  <IconButton label={t("docs.apps.approve")} onClick={() => s.decideApproval(a.id, "approved")}>
                    <CheckCircle size={16} aria-hidden />
                  </IconButton>
                  <IconButton label={t("docs.apps.reject")} onClick={() => s.decideApproval(a.id, "rejected")}>
                    <XCircle size={16} aria-hidden />
                  </IconButton>
                </>
              ) : (
                <Badge tone={a.status === "approved" ? "positive" : "danger"}>{t(`docs.apps.status.${a.status}`)}</Badge>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {/* Shifts */}
      <Card>
        <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
          <CalendarBlank size={18} aria-hidden /> {t("docs.apps.shifts")}
        </h3>
        <div className="mb-2 flex items-center gap-2 text-base">
          <Badge tone="accent">{t("docs.apps.weeklyHours", { n: myHours })}</Badge>
          {conflict ? <Badge tone="danger">{t("docs.apps.conflict")}</Badge> : null}
        </div>
        <ul className="space-y-1">
          {s.shifts.map((sh) => (
            <li key={sh.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base">
              <span className="text-muted">{days[sh.day]}</span>
              <span className="flex-1 text-fg">{hhmm(sh.startMin)}–{hhmm(sh.endMin)} · {sh.role}</span>
              {sh.open || sh.userId === "" ? (
                <Button variant="ghost" onClick={() => s.claimShift(sh.id)}>
                  <HandGrabbing size={16} aria-hidden /> {t("docs.apps.claim")}
                </Button>
              ) : (
                <span className="text-muted">{sh.userName}</span>
              )}
            </li>
          ))}
        </ul>
        {open.length === 0 ? <p className="mt-1 text-base text-muted">{t("docs.apps.noOpenShifts")}</p> : null}
      </Card>

      {/* Forms */}
      <Card>
        <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
          <ChartBar size={18} aria-hidden /> {t("docs.apps.forms")}
        </h3>
        {s.forms.map((f) => {
          const counts = tallyResponses(f, s.responses);
          const total = Object.values(counts).reduce((n, c) => n + c, 0) || 1;
          return (
            <div key={f.id} className="space-y-1">
              <div className="text-base text-fg">{f.question}</div>
              {f.options.map((o) => (
                <button
                  key={o.id}
                  onClick={() => s.respondForm(f.id, o.id)}
                  className="block w-full rounded-md border border-border px-3 py-1.5 text-left text-base text-fg hover:bg-raised"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-1">{o.text}</span>
                    <span className="tabular-nums text-muted">{counts[o.id]}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-border" aria-hidden>
                    <div className="h-1.5 rounded-full bg-accent" style={{ width: `${Math.round((counts[o.id] / total) * 100)}%` }} />
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
