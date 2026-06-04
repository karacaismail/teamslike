import * as React from "react";
import { Forbidden } from "@/components/ui/Forbidden";
import { useTranslation } from "react-i18next";
import { Prohibit, Sliders, Globe, Armchair } from "@/lib/icons";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { useUrlSelection } from "@/lib/useUrlSelection";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { useTabKeys } from "@/lib/useTabKeys";
import { useSchedulingStore } from "./schedulingStore";
import { EventTypeList } from "./components/EventTypeList";
import { EventTypeEditor } from "./components/EventTypeEditor";
import { AvailabilityEditor } from "./components/AvailabilityEditor";
import { BookingsCalendar } from "./components/BookingsCalendar";
import { PublicBookingPage } from "./components/PublicBookingPage";
import { WorkspaceReservation } from "./components/WorkspaceReservation";

export function SchedulingPage() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.can);
  const [view, setView] = React.useState<"console" | "public" | "workspace">("console");
  const onTabKey = useTabKeys(["console", "public", "workspace"] as const, view, setView);

  // Deep-link the selected event type (?type=…) so a booking link is shareable
  // and survives reload. (J2)
  const activeEventTypeId = useSchedulingStore((s) => s.activeEventTypeId);
  const setActiveEventType = useSchedulingStore((s) => s.setActiveEventType);
  const eventTypes = useSchedulingStore((s) => s.eventTypes);
  useUrlSelection("type", activeEventTypeId, setActiveEventType, (id) => eventTypes.some((e) => e.id === id));

  // Re-select an event type that belongs to the active workspace on switch (J5).
  const workspaceId = useTenantStore((s) => s.workspaceId);
  React.useEffect(() => {
    const visible = eventTypes.filter((et) => et.workspaceId == null || et.workspaceId === workspaceId);
    if (visible[0] && !visible.some((et) => et.id === activeEventTypeId)) setActiveEventType(visible[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  if (!can("scheduling.view")) {
    return <Forbidden />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-fg">{t("nav.scheduling")}</h1>
          <p className="mt-1 text-base text-muted">{t("scheduling.subtitle")}</p>
        </div>
        <div className="inline-flex overflow-hidden rounded-md border border-border" role="tablist" aria-label={t("nav.scheduling")}>
          {([
            { id: "console", Icon: Sliders, label: t("scheduling.console") },
            { id: "public", Icon: Globe, label: t("scheduling.publicPage") },
            { id: "workspace", Icon: Armchair, label: t("scheduling.workspace.tab") },
          ] as const).map(({ id, Icon, label }) => (
            <button
              key={id}
              role="tab"
              data-tab={id}
              aria-selected={view === id}
              tabIndex={view === id ? 0 : -1}
              onClick={() => setView(id)}
              onKeyDown={onTabKey}
              className={cn("inline-flex h-11 items-center gap-2 px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset", view === id ? "bg-accent text-accent-fg" : "bg-surface text-fg")}
            >
              <Icon size={18} aria-hidden /> {label}
            </button>
          ))}
        </div>
      </div>

      {view === "console" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <EventTypeList />
          </div>
          <div className="space-y-4 lg:col-span-2">
            <EventTypeEditor />
            <AvailabilityEditor />
            <BookingsCalendar />
          </div>
        </div>
      ) : view === "workspace" ? (
        <WorkspaceReservation />
      ) : (
        <PublicBookingPage />
      )}
    </div>
  );
}
