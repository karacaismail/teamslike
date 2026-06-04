import * as React from "react";
import { useTranslation } from "react-i18next";
import { useSchedulingStore } from "../schedulingStore";
import { HOST_NAMES } from "../data";
import { Badge, Card } from "@/components/ui/primitives";

export function EventTypeEditor() {
  const { t } = useTranslation();
  const et = useSchedulingStore((s) => s.eventTypes.find((e) => e.id === s.activeEventTypeId) ?? null);

  // Local editor draft (FastAPI PATCH /event-types/:id on save in production).
  const [duration, setDuration] = React.useState(et?.durationMin ?? 30);
  const [bufferAfter, setBufferAfter] = React.useState(et?.bufferAfter ?? 0);
  const [minNotice, setMinNotice] = React.useState(et?.minNoticeMin ?? 0);
  React.useEffect(() => {
    if (!et) return;
    setDuration(et.durationMin);
    setBufferAfter(et.bufferAfter);
    setMinNotice(et.minNoticeMin);
  }, [et?.id]);

  if (!et) return null;

  const num = (label: string, value: number, set: (n: number) => void) => (
    <label className="flex flex-col gap-1 text-base text-muted">
      {label}
      <input
        type="number"
        value={value}
        min={0}
        onChange={(e) => set(Number(e.target.value))}
        className="h-11 w-24 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none"
      />
    </label>
  );

  return (
    <Card>
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-base font-semibold text-fg">{et.title}</h3>
        <Badge tone="accent">{t(`scheduling.assignment.${et.assignment}`)}</Badge>
      </div>
      <div className="flex flex-wrap gap-3">
        {num(t("scheduling.duration"), duration, setDuration)}
        {num(t("scheduling.bufferAfter"), bufferAfter, setBufferAfter)}
        {num(t("scheduling.minNotice"), minNotice, setMinNotice)}
      </div>
      <div className="mt-3 text-base text-muted">
        {t("scheduling.hosts")}: {et.hostIds.map((h) => HOST_NAMES[h] ?? h).join(", ")}
      </div>
    </Card>
  );
}
