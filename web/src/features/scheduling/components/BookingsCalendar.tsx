import * as React from "react";
import { useTranslation } from "react-i18next";
import { CalendarCheck, X, ArrowsClockwise } from "@/lib/icons";
import { useSchedulingStore } from "../schedulingStore";
import { HOST_NAMES } from "../data";
import { Badge, Button, Card, IconButton } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const fmt = (ms: number) =>
  new Date(ms).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export function BookingsCalendar() {
  const { t } = useTranslation();
  const bookings = useSchedulingStore((s) => s.bookings);
  const eventTypes = useSchedulingStore((s) => s.eventTypes);
  const cancel = useSchedulingStore((s) => s.cancel);
  const reschedule = useSchedulingStore((s) => s.reschedule);
  const [cancelId, setCancelId] = React.useState<string | null>(null);
  const cancelTarget = bookings.find((b) => b.id === cancelId) ?? null;

  const upcoming = bookings.slice().sort((a, b) => a.startMs - b.startMs);
  const tone = { confirmed: "positive", rescheduled: "accent", pending: "warning", cancelled: "danger" } as const;

  return (
    <Card>
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
        <CalendarCheck size={18} aria-hidden /> {t("scheduling.bookings")}
      </h3>
      {upcoming.length === 0 ? (
        <p className="text-base text-muted">{t("scheduling.noBookings")}</p>
      ) : (
        <ul className="divide-y divide-border">
          {upcoming.map((b) => {
            const et = eventTypes.find((e) => e.id === b.eventTypeId);
            return (
              <li key={b.id} className="flex items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base text-fg">{b.inviteeName} · {et?.title}</div>
                  <div className="truncate text-base text-muted">
                    {fmt(b.startMs)}{b.hostId ? ` · ${HOST_NAMES[b.hostId] ?? b.hostId}` : ""}
                  </div>
                </div>
                <Badge tone={tone[b.status]}>{t(`scheduling.bookingStatus.${b.status}`)}</Badge>
                {b.status !== "cancelled" ? (
                  <>
                    <IconButton label={t("scheduling.reschedule")} onClick={() => reschedule(b.id, b.startMs + 24 * 60 * 60000)}>
                      <ArrowsClockwise size={16} aria-hidden />
                    </IconButton>
                    <IconButton label={t("scheduling.cancel")} onClick={() => setCancelId(b.id)}>
                      <X size={16} aria-hidden />
                    </IconButton>
                  </>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(v) => { if (!v) setCancelId(null); }}
        title={t("scheduling.cancel")}
        body={cancelTarget ? t("scheduling.cancelConfirm", { name: cancelTarget.inviteeName }) : ""}
        confirmLabel={t("scheduling.cancel")}
        onConfirm={() => { if (cancelId) cancel(cancelId); setCancelId(null); }}
      />
    </Card>
  );
}
