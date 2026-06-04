import { useTranslation } from "react-i18next";
import { Armchair, Door, CheckCircle, X, MapPin, Sun, MoonStars, Clock } from "@/lib/icons";
import { useWorkspaceStore } from "../workspaceStore";
import { deskAvailability, occupancyRate } from "../workspace";
import { memberName } from "@/lib/identity";
import { Badge, Button, Card, IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import type { DeskSlot } from "../types";

const SLOTS: { key: DeskSlot; icon: ReactNode }[] = [
  { key: "am", icon: <Sun size={16} aria-hidden /> },
  { key: "pm", icon: <MoonStars size={16} aria-hidden /> },
  { key: "full", icon: <Clock size={16} aria-hidden /> },
];

/** Zoom Spaces parity: hot-desk / room reservation with AM/PM/full-day slots. */
export function WorkspaceReservation() {
  const { t } = useTranslation();
  const s = useWorkspaceStore();
  const avail = deskAvailability(s.desks, s.reservations, s.dateISO, s.slot);
  const occ = Math.round(occupancyRate(s.desks, s.reservations, s.dateISO) * 100);
  const mine = s.reservations
    .filter((r) => r.dateISO === s.dateISO)
    .sort((a, b) => a.deskId.localeCompare(b.deskId));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-1 text-base font-semibold text-fg">
              <Armchair size={18} aria-hidden /> {t("scheduling.workspace.desks")}
            </h3>
            <Badge tone={occ >= 80 ? "danger" : occ >= 50 ? "warning" : "positive"}>
              {t("scheduling.workspace.occupancy", { pct: occ })}
            </Badge>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-base text-fg">
              {t("scheduling.workspace.date")}
              <input
                type="date"
                value={s.dateISO}
                onChange={(e) => s.setDate(e.target.value)}
                aria-label={t("scheduling.workspace.date")}
                className="h-10 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none"
              />
            </label>
            <div className="inline-flex overflow-hidden rounded-md border border-border" role="group" aria-label={t("scheduling.workspace.slot")}>
              {SLOTS.map(({ key, icon }) => (
                <button
                  key={key}
                  aria-pressed={s.slot === key}
                  onClick={() => s.setSlot(key)}
                  className={cn(
                    "inline-flex h-10 items-center gap-1 px-3 text-base",
                    s.slot === key ? "bg-accent text-accent-fg" : "bg-surface text-fg",
                  )}
                >
                  {icon} {t(`scheduling.workspace.slots.${key}`)}
                </button>
              ))}
            </div>
          </div>

          <ul className="divide-y divide-border">
            {avail.map((d) => (
              <li key={d.id} className="flex items-center gap-2 py-2">
                <span className="text-muted" aria-hidden>
                  {d.kind === "room" ? <Door size={18} /> : <Armchair size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base text-fg">
                    {d.label}
                    {d.kind === "room" ? ` · ${t("scheduling.workspace.seats", { n: d.capacity })}` : ""}
                  </div>
                  <div className="flex items-center gap-1 truncate text-base text-muted">
                    <MapPin size={13} aria-hidden /> {d.zone}
                    {d.amenities.length ? ` · ${d.amenities.join(", ")}` : ""}
                  </div>
                </div>
                {d.free ? (
                  <Button variant="secondary" onClick={() => s.reserve(d.id)}>
                    {t("scheduling.workspace.reserve")}
                  </Button>
                ) : (
                  <Badge tone="neutral">
                    {t("scheduling.workspace.takenBy", { who: memberName(d.takenBy!.userId) })}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="lg:col-span-1">
        <h3 className="mb-2 text-base font-semibold text-fg">{t("scheduling.workspace.mine")}</h3>
        {mine.length === 0 ? (
          <p className="text-base text-muted">{t("scheduling.workspace.mineEmpty")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {mine.map((r) => {
              const desk = s.desks.find((d) => d.id === r.deskId);
              return (
                <li key={r.id} className="flex items-center gap-2 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base text-fg">{desk?.label ?? r.deskId}</div>
                    <div className="truncate text-base text-muted">
                      {memberName(r.userId)} · {t(`scheduling.workspace.slots.${r.slot}`)}
                    </div>
                  </div>
                  {r.checkedIn ? (
                    <Badge tone="positive">{t("scheduling.workspace.checkedIn")}</Badge>
                  ) : (
                    <IconButton label={t("scheduling.workspace.checkIn")} onClick={() => s.checkIn(r.id)}>
                      <CheckCircle size={16} aria-hidden />
                    </IconButton>
                  )}
                  <IconButton label={t("scheduling.workspace.cancel")} onClick={() => s.cancel(r.id)}>
                    <X size={16} aria-hidden />
                  </IconButton>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
