import * as React from "react";
import { useTranslation } from "react-i18next";
import { Broadcast, Play, UsersThree } from "@/lib/icons";
import { useEventStore } from "../eventStore";
import { simulivePosition } from "../webinar";
import { Badge } from "@/components/ui/primitives";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function StageView() {
  const { t } = useTranslation();
  const event = useEventStore((s) => s.events.find((e) => e.id === s.activeEventId)!);
  const mode = useEventStore((s) => s.mode);
  const attendees = useEventStore((s) => s.attendees);
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const pos = simulivePosition(event.startsAt, now, event.durationSec);
  const liveBadge = mode === "live";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-raised">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Badge tone={pos.live ? "danger" : "neutral"}>
          <Broadcast size={14} aria-hidden /> {liveBadge ? t("webinar.live") : t(`webinar.modeLabel.${mode}`)}
        </Badge>
        <span className="ml-auto inline-flex items-center gap-1 text-base text-muted">
          <UsersThree size={16} aria-hidden /> {attendees.toLocaleString()}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-fg">
          <Play size={28} weight="fill" aria-hidden />
        </div>
        <div className="text-xl font-semibold text-fg">{event.title}</div>
        <div className="text-base text-muted">{event.sessions[0]?.title}</div>
      </div>

      <div className="border-t border-border px-3 py-2" aria-label={t("webinar.timeline")}>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
          <div className="h-full bg-accent" style={{ width: `${pos.pct}%` }} aria-hidden />
        </div>
        <div className="mt-1 flex justify-between text-base text-muted">
          <span>{fmt(pos.elapsedSec)}</span>
          <span>{fmt(event.durationSec)}</span>
        </div>
      </div>
    </div>
  );
}
