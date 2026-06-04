import { useTranslation } from "react-i18next";
import { CalendarBlank } from "@/lib/icons";
import { useEventStore } from "../eventStore";
import { eventStatus } from "../webinar";
import { Badge, Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { EventType } from "../types";

const MODES: EventType[] = ["live", "simulive", "evergreen", "ondemand", "townhall"];

export function EventBuilder() {
  const { t } = useTranslation();
  const event = useEventStore((s) => s.events.find((e) => e.id === s.activeEventId)!);
  const mode = useEventStore((s) => s.mode);
  const setMode = useEventStore((s) => s.setMode);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-3 text-base font-semibold text-fg">{t("webinar.details")}</h3>
        <dl className="space-y-3 text-base">
          <div>
            <dt className="text-muted">{t("webinar.title")}</dt>
            <dd className="flex items-center gap-2 text-lg font-semibold text-fg">
              {event.title}
              {(() => {
                const st = eventStatus(event.startsAt, event.durationSec);
                return <Badge tone={st === "live" ? "positive" : st === "upcoming" ? "accent" : "neutral"}>{t(`webinar.status.${st}`)}</Badge>;
              })()}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-muted">{t("webinar.mode")}</dt>
            <dd className="flex flex-wrap gap-1.5">
              {MODES.map((m) => (
                <button
                  key={m}
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-md border px-3 py-1 text-base",
                    mode === m ? "border-accent text-accent" : "border-border text-muted hover:bg-surface",
                  )}
                >
                  {t(`webinar.modeLabel.${m}`)}
                </button>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-muted">{t("webinar.capacity")}</dt>
            <dd className="text-fg">{event.capacity.toLocaleString()}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-muted">{t("webinar.brand")}</dt>
            <dd className="inline-flex items-center gap-2">
              <span className="inline-block h-5 w-5 rounded-sm border border-border" style={{ background: event.branding.accent }} aria-hidden />
              <span className="text-fg">{event.branding.accent}</span>
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h3 className="mb-2 text-base font-semibold text-fg">{t("webinar.sessions")}</h3>
        <ul className="space-y-1.5">
          {event.sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-base">
              <CalendarBlank size={16} className="text-muted" aria-hidden />
              <span className="flex-1 text-fg">{s.title}</span>
              <Badge tone="neutral">{new Date(s.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
