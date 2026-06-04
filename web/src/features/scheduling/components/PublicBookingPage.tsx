import * as React from "react";
import { useTranslation } from "react-i18next";
import { Clock, VideoCamera, Check, CaretLeft, CalendarBlank } from "@/lib/icons";
import { useUnsavedGuard } from "@/lib/useUnsavedGuard";
import { downloadText } from "@/lib/download";
import { useSchedulingStore } from "../schedulingStore";
import { generateSlots, detectTimezone } from "../slots";
import { buildIcs } from "../ics";
import { reminderTimes } from "../reminders";
import { HOST_NAMES } from "../data";
import { Button, Card } from "@/components/ui/primitives";

function nextWeekdayISO(from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function PublicBookingPage() {
  const { t } = useTranslation();
  const et = useSchedulingStore((s) => s.eventTypes.find((e) => e.id === s.activeEventTypeId)!);
  const schedule = useSchedulingStore((s) => s.schedules[0]);
  const book = useSchedulingStore((s) => s.book);

  const [dateISO, setDateISO] = React.useState(nextWeekdayISO());
  const [tz] = React.useState(detectTimezone());
  const [picked, setPicked] = React.useState<number | null>(null);
  const [step, setStep] = React.useState<"slot" | "form" | "done">("slot");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  // Guard a partially-filled booking against accidental reload / tab-close (J6).
  useUnsavedGuard("scheduling-booking", step !== "done" && (name.trim() !== "" || email.trim() !== ""));

  const slots = generateSlots(schedule, et, dateISO, Date.now());

  const confirm = () => {
    if (picked == null || !name.trim() || !email.trim()) return;
    book(et.id, name.trim(), email.trim(), picked);
    setStep("done");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <header className="mb-3 border-b border-border pb-3">
          <div className="text-base text-muted">{HOST_NAMES[et.hostIds[0]] ?? et.hostIds[0]}</div>
          <h2 className="text-2xl font-bold text-fg">{et.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-base text-muted">
            <span className="inline-flex items-center gap-1"><Clock size={16} aria-hidden /> {t("scheduling.minutes", { n: et.durationMin })}</span>
            <span className="inline-flex items-center gap-1"><VideoCamera size={16} aria-hidden /> {t(`scheduling.location.${et.location}`)}</span>
            <span>{tz}</span>
          </div>
        </header>

        {step === "slot" ? (
          <div>
            <label className="mb-2 flex items-center gap-2 text-base text-muted">
              <CalendarBlank size={16} aria-hidden /> {t("scheduling.pickDate")}
              <input type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} className="h-10 rounded-md border border-border bg-bg px-2 text-base text-fg" />
            </label>
            {slots.length === 0 ? (
              <p className="text-base text-muted">{t("scheduling.noSlots")}</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="listbox" aria-label={t("scheduling.pickTime")}>
                {slots.map((s) => (
                  <button
                    key={s.startMs}
                    role="option"
                    aria-selected={picked === s.startMs}
                    onClick={() => { setPicked(s.startMs); setStep("form"); }}
                    className="h-11 rounded-md border border-border bg-surface text-base text-fg hover:border-accent"
                  >
                    {fmtTime(s.startMs)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {step === "form" ? (
          <div className="space-y-2">
            <button onClick={() => setStep("slot")} className="inline-flex items-center gap-1 text-base text-muted hover:text-fg">
              <CaretLeft size={14} aria-hidden /> {t("scheduling.back")}
            </button>
            <div className="text-base text-fg">{picked != null ? fmtTime(picked) : ""}</div>
            <label className="block">
              <span className="text-base text-fg">{t("scheduling.name")}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-2 text-base text-fg outline-none" />
            </label>
            <label className="block">
              <span className="text-base text-fg">{t("scheduling.email")}</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-2 text-base text-fg outline-none" />
            </label>
            <Button className="w-full" disabled={!name.trim() || !email.trim()} onClick={confirm}>{t("scheduling.confirm")}</Button>
          </div>
        ) : null}

        {step === "done" ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-positive text-white"><Check size={28} weight="bold" aria-hidden /></span>
            <h3 className="text-xl font-semibold text-fg">{t("scheduling.booked")}</h3>
            <p className="text-base text-muted">{picked != null ? fmtTime(picked) : ""} · {et.title}</p>
            {picked != null ? (
              <Button
                variant="secondary"
                onClick={() =>
                  downloadText(
                    `${et.title}.ics`,
                    buildIcs({ start: picked, durationMin: et.durationMin, title: et.title, attendeeEmail: email || undefined }),
                    "text/calendar",
                  )
                }
              >
                <CalendarBlank size={18} aria-hidden /> {t("scheduling.addToCalendar")}
              </Button>
            ) : null}
            {picked != null ? (
              <p className="text-base text-muted">
                {t("scheduling.reminders")}: {reminderTimes(picked, [1440, 60]).map((ms) => new Date(ms).toLocaleString()).join(" · ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
