import * as React from "react";
import { useTranslation } from "react-i18next";
import { useSchedulingStore } from "../schedulingStore";
import { detectTimezone } from "../slots";
import { TimezonePicker } from "./TimezonePicker";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
const fmtMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export function AvailabilityEditor() {
  const { t } = useTranslation();
  const schedule = useSchedulingStore((s) => s.schedules[0]);
  const [tz, setTz] = React.useState(schedule?.timezone || detectTimezone());

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-fg">{t("scheduling.availability")}</h3>
        <TimezonePicker value={tz} onChange={setTz} />
      </div>
      <ul className="space-y-1">
        {WEEKDAYS.map((wd) => {
          const rule = schedule?.rules.find((r) => r.weekday === wd);
          return (
            <li key={wd} className="flex items-center gap-2 text-base">
              <span className={cn("w-28", rule ? "text-fg" : "text-muted")}>{t(`scheduling.weekday.${wd}`)}</span>
              {rule ? (
                <span className="text-fg">{fmtMin(rule.startMin)} – {fmtMin(rule.endMin)}</span>
              ) : (
                <span className="text-muted">{t("scheduling.unavailable")}</span>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
