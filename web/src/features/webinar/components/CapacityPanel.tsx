import { useTranslation } from "react-i18next";
import { UsersThree, Television, Check, X, ArrowUp } from "@/lib/icons";
import { useEventStore } from "../eventStore";
import { registrationCapacity } from "../webinar";
import { Badge, Button, Card, IconButton } from "@/components/ui/primitives";

/** Town-hall capacity tiers + manual-approval queue + waitlist admit (Teams parity). */
export function CapacityPanel() {
  const { t } = useTranslation();
  const event = useEventStore((s) => s.events.find((e) => e.id === s.activeEventId)!);
  const registrations = useEventStore((s) => s.registrations);
  const approve = useEventStore((s) => s.approveRegistration);
  const reject = useEventStore((s) => s.rejectRegistration);
  const admitNext = useEventStore((s) => s.admitNext);

  const cap = registrationCapacity(event, registrations);
  const pending = registrations.filter((r) => r.eventId === event.id && r.approval === "pending");

  return (
    <Card>
      <div className="mb-2 flex items-center gap-2">
        <h3 className="flex-1 text-base font-semibold text-fg">{t("webinar.cap.title")}</h3>
        {event.type === "townhall" ? <Badge tone="accent">{t("webinar.modeLabel.townhall")}</Badge> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base text-fg">
          <UsersThree size={18} className="text-muted" aria-hidden />
          {t("webinar.cap.interactive")}: {cap.interactive.used}/{cap.interactive.limit}
          {cap.interactive.full ? <Badge tone="warning">{t("webinar.cap.full")}</Badge> : null}
        </div>
        {cap.viewOnly ? (
          <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base text-fg">
            <Television size={18} className="text-muted" aria-hidden />
            {t("webinar.cap.viewOnly")}: {cap.viewOnly.used}/{cap.viewOnly.limit}
          </div>
        ) : null}
        <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base text-fg">
          {t("webinar.cap.waitlist")}: {cap.waitlisted}
          {cap.waitlisted > 0 ? (
            <Button variant="ghost" onClick={admitNext}><ArrowUp size={16} aria-hidden /> {t("webinar.cap.admitNext")}</Button>
          ) : null}
        </div>
      </div>

      {pending.length > 0 ? (
        <div className="mt-3 border-t border-border pt-3">
          <h4 className="mb-1.5 text-base font-medium text-muted">{t("webinar.cap.pending", { n: pending.length })}</h4>
          <ul className="space-y-1">
            {pending.map((r) => (
              <li key={r.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base">
                <span className="min-w-0 flex-1 truncate text-fg">{r.values.name ?? r.id}</span>
                <IconButton label={t("webinar.cap.approve")} onClick={() => approve(r.id)}>
                  <Check size={16} aria-hidden />
                </IconButton>
                <IconButton label={t("webinar.cap.reject")} onClick={() => reject(r.id)}>
                  <X size={16} aria-hidden />
                </IconButton>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
