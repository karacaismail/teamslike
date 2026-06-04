import { useTranslation } from "react-i18next";
import { PhoneIncoming, PhoneOutgoing, PhoneCall, ShieldWarning, ProhibitInset } from "@/lib/icons";
import { useCallStore } from "../callStore";
import { CONTACTS } from "../data";
import { callerName, classifyCaller } from "../routing";
import { fmtDuration } from "./CallStateChip";
import { Badge, Card, IconButton, Skeleton } from "@/components/ui/primitives";
import { useFirstLoad } from "@/lib/useFirstLoad";
import type { CallEndReason } from "../types";

/** Loading placeholder shaped like a call row: direction icon + name/time +
 *  the two round call-row actions (block, dial). */
function CallHistorySkeleton({ label, rows = 5 }: { label: string; rows?: number }) {
  return (
    <ul className="divide-y divide-border" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 py-2.5" aria-hidden>
          <Skeleton className="h-5 w-5 shrink-0 rounded-sm" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

const reasonTone: Record<CallEndReason, "positive" | "danger" | "warning" | "accent"> = {
  completed: "positive",
  missed: "danger",
  declined: "warning",
  voicemail: "accent",
};

function ago(ts: number, t: (k: string, o?: Record<string, unknown>) => string): string {
  const min = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (min < 60) return t("time.minutesAgo", { n: min });
  return t("time.hoursAgo", { n: Math.round(min / 60) });
}

export function CallHistory() {
  const { t } = useTranslation();
  const history = useCallStore((s) => s.history);
  const place = useCallStore((s) => s.place);
  const active = useCallStore((s) => s.activeCall);
  const blocklist = useCallStore((s) => s.blocklist);
  const blockNumber = useCallStore((s) => s.blockNumber);
  const unblock = useCallStore((s) => s.unblock);
  const firstLoad = useFirstLoad();

  return (
    <Card>
      <h3 className="mb-2 text-base font-semibold text-fg">{t("phone.history.title")}</h3>
      {firstLoad ? (
        <CallHistorySkeleton label={t("common.loading")} />
      ) : history.length === 0 ? (
        <p className="text-base text-muted">{t("phone.history.empty")}</p>
      ) : (
        <ul className="divide-y divide-border">
          {history.map((c) => {
            const remote = c.direction === "outbound" ? c.to : c.from;
            const Dir = c.direction === "inbound" ? PhoneIncoming : PhoneOutgoing;
            const cls = classifyCaller(remote, { contacts: CONTACTS, blocklist });
            const blocked = cls === "blocked";
            return (
              <li key={c.id} className="flex items-center gap-3 py-2">
                <Dir
                  size={18}
                  className={c.endReason === "missed" ? "text-danger" : "text-muted"}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base text-fg">{callerName(remote, CONTACTS)}</div>
                  <div className="flex items-center gap-2 text-base text-muted">
                    <span>{ago(c.startedAt, t)}</span>
                    {c.durationSec > 0 ? <span>· {fmtDuration(c.durationSec)}</span> : null}
                  </div>
                </div>
                {cls === "spam" || blocked ? (
                  <Badge tone="danger">
                    <ShieldWarning size={14} aria-hidden /> {t(`phone.caller.${cls}`)}
                  </Badge>
                ) : null}
                {c.endReason ? (
                  <Badge tone={reasonTone[c.endReason]}>{t(`phone.endReason.${c.endReason}`)}</Badge>
                ) : null}
                <IconButton
                  label={blocked ? t("phone.unblock") : t("phone.block")}
                  variant={blocked ? "primary" : "ghost"}
                  onClick={() => (blocked ? unblock(remote) : blockNumber(remote))}
                >
                  <ProhibitInset size={18} aria-hidden />
                </IconButton>
                <IconButton label={t("phone.call")} disabled={!!active || blocked} onClick={() => place(remote)}>
                  <PhoneCall size={18} aria-hidden />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
