import { useTranslation } from "react-i18next";
import { useEventStore } from "../eventStore";
import { usePollStore } from "../pollStore";
import { segmentAttendees } from "../webinar";
import { Card, StatCard } from "@/components/ui/primitives";

export function AnalyticsTab() {
  const { t } = useTranslation();
  const activeEventId = useEventStore((s) => s.activeEventId);
  const registrations = useEventStore((s) => s.registrations).filter((r) => r.eventId === activeEventId);
  const attendees = useEventStore((s) => s.attendees);
  const polls = usePollStore((s) => s.polls);
  const seg = segmentAttendees(registrations);

  // UTM source breakdown.
  const bySource = registrations.reduce<Record<string, number>>((acc, r) => {
    const src = r.utm?.source ?? "direct";
    acc[src] = (acc[src] ?? 0) + 1;
    return acc;
  }, {});
  const pollVotes = polls.reduce((n, p) => n + p.options.reduce((m, o) => m + o.votes.length, 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("webinar.analytics.registered")} value={String(seg.registered)} />
        <StatCard label={t("webinar.analytics.attended")} value={String(seg.attended)} />
        <StatCard label={t("webinar.analytics.noShow")} value={String(seg.noShow)} />
        <StatCard label={t("webinar.analytics.showRate")} value={`${Math.round(seg.showRate * 100)}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-base font-semibold text-fg">{t("webinar.analytics.sources")}</h3>
          <ul className="space-y-1">
            {Object.entries(bySource).map(([src, n]) => (
              <li key={src} className="flex items-center gap-2 text-base">
                <span className="flex-1 text-fg">{src}</span>
                <span className="text-muted">{n}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-2 text-base font-semibold text-fg">{t("webinar.analytics.engagement")}</h3>
          <dl className="space-y-1 text-base">
            <div className="flex justify-between"><dt className="text-muted">{t("webinar.analytics.liveAttendees")}</dt><dd className="text-fg">{attendees.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">{t("webinar.analytics.pollVotes")}</dt><dd className="text-fg">{pollVotes}</dd></div>
          </dl>
          <p className="mt-2 text-base text-muted">{t("webinar.analytics.intentNote")}</p>
        </Card>
      </div>
    </div>
  );
}
