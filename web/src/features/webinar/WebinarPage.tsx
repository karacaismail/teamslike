import { useTranslation } from "react-i18next";
import { Forbidden } from "@/components/ui/Forbidden";
import { Prohibit, Television, Monitor } from "@/lib/icons";
import { useAuthStore } from "@/store/authStore";
import { Button, Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { useUrlSelection } from "@/lib/useUrlSelection";
import { useEventStore } from "./eventStore";
import { EventConsole } from "./components/EventConsole";
import { EventLive } from "./components/EventLive";

export function WebinarPage() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.can);
  const phase = useEventStore((s) => s.phase);
  const goLive = useEventStore((s) => s.goLive);
  const exitLive = useEventStore((s) => s.exitLive);
  const event = useEventStore((s) => s.events.find((e) => e.id === s.activeEventId)!);
  const activeEventId = useEventStore((s) => s.activeEventId);
  const setEvent = useEventStore((s) => s.setEvent);
  const events = useEventStore((s) => s.events);
  // Deep-link the active event (?event=) — shareable + reload-safe (J2).
  useUrlSelection("event", activeEventId, setEvent, (id) => events.some((e) => e.id === id));

  if (!can("webinar.view")) {
    return <Forbidden />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-fg">{t("nav.webinar")}</h1>
          <p className="mt-1 text-base text-muted">{event.title}</p>
        </div>
        <div className="inline-flex overflow-hidden rounded-md border border-border" role="tablist" aria-label={t("webinar.view")}>
          <button
            role="tab"
            aria-selected={phase === "console"}
            onClick={exitLive}
            className={cn("inline-flex h-11 items-center gap-2 px-3 text-base", phase === "console" ? "bg-accent text-accent-fg" : "bg-surface text-fg")}
          >
            <Monitor size={18} aria-hidden /> {t("webinar.console")}
          </button>
          <button
            role="tab"
            aria-selected={phase === "live"}
            onClick={goLive}
            className={cn("inline-flex h-11 items-center gap-2 px-3 text-base", phase === "live" ? "bg-accent text-accent-fg" : "bg-surface text-fg")}
          >
            <Television size={18} aria-hidden /> {t("webinar.livePreview")}
          </button>
        </div>
      </div>

      {phase === "console" ? <EventConsole /> : <EventLive />}
    </div>
  );
}
