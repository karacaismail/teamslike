import { useTranslation } from "react-i18next";
import { Clock, UsersThree, User } from "@/lib/icons";
import { useSchedulingStore } from "../schedulingStore";
import { useTenantStore } from "@/store/tenantStore";
import { Badge, Card, Skeleton } from "@/components/ui/primitives";
import { useFirstLoad } from "@/lib/useFirstLoad";
import { cn } from "@/lib/cn";

/** Loading placeholder matching an event-type card: title + duration/assignment
 *  row + booking-slug line. */
function EventTypeListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="space-y-1.5" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="space-y-2 rounded-md border border-border px-3 py-2.5">
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20 rounded-sm" />
          </div>
          <Skeleton className="h-3 w-1/2" />
        </li>
      ))}
    </ul>
  );
}

export function EventTypeList() {
  const { t } = useTranslation();
  const eventTypes = useSchedulingStore((s) => s.eventTypes);
  const activeId = useSchedulingStore((s) => s.activeEventTypeId);
  const setActive = useSchedulingStore((s) => s.setActiveEventType);
  // Event types are scoped to the active workspace (J5).
  const workspaceId = useTenantStore((s) => s.workspaceId);
  const visible = eventTypes.filter((et) => et.workspaceId == null || et.workspaceId === workspaceId);
  const firstLoad = useFirstLoad();

  if (firstLoad)
    return (
      <Card className="p-3">
        <h3 className="mb-2 text-base font-semibold text-fg">{t("scheduling.eventTypes")}</h3>
        <div role="status" aria-live="polite">
          <span className="sr-only">{t("common.loading")}</span>
          <EventTypeListSkeleton />
        </div>
      </Card>
    );

  return (
    <Card className="p-3">
      <h3 className="mb-2 text-base font-semibold text-fg">{t("scheduling.eventTypes")}</h3>
      <ul className="space-y-1.5">
        {visible.map((et) => (
          <li key={et.id}>
            <button
              onClick={() => setActive(et.id)}
              aria-current={activeId === et.id}
              className={cn(
                "flex w-full flex-col gap-1 rounded-md border px-3 py-2 text-left",
                activeId === et.id ? "border-accent" : "border-border hover:bg-surface",
              )}
            >
              <span className="text-base font-medium text-fg">{et.title}</span>
              <span className="flex items-center gap-2 text-base text-muted">
                <Clock size={14} aria-hidden /> {t("scheduling.minutes", { n: et.durationMin })}
                <Badge tone="neutral">
                  {et.assignment === "roundrobin" ? <UsersThree size={12} aria-hidden /> : <User size={12} aria-hidden />}
                  {t(`scheduling.assignment.${et.assignment}`)}
                </Badge>
              </span>
              <span className="truncate text-base text-muted">aura.dev/{et.slug}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
