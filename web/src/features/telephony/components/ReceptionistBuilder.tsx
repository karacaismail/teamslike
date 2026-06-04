import * as React from "react";
import { useTranslation } from "react-i18next";
import { Headset, Plus, Trash, PaperPlaneRight, Robot, User } from "@/lib/icons";
import { useReceptionistStore } from "../receptionistStore";
import { SCHEDULE } from "../data";
import { isWithinHours } from "../pbx";
import { receptionistGreeting } from "../receptionist";
import { Badge, Button, Card, EmptyState, IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { CaptureField, ReceptionistActionKind } from "../types";

const ACTIONS: ReceptionistActionKind[] = [
  "route_queue",
  "route_extension",
  "answer_faq",
  "book",
  "voicemail",
  "human",
];
const CAPTURE: CaptureField[] = ["name", "phone", "reason"];
const actionTone: Record<ReceptionistActionKind, "accent" | "positive" | "warning" | "neutral"> = {
  route_queue: "accent",
  route_extension: "accent",
  answer_faq: "positive",
  book: "positive",
  voicemail: "warning",
  human: "neutral",
};

export function ReceptionistBuilder() {
  const { t } = useTranslation();
  const config = useReceptionistStore((s) => s.config);
  const session = useReceptionistStore((s) => s.session);
  const toggleEnabled = useReceptionistStore((s) => s.toggleEnabled);
  const setGreeting = useReceptionistStore((s) => s.setGreeting);
  const setAfterHours = useReceptionistStore((s) => s.setAfterHoursGreeting);
  const toggleSms = useReceptionistStore((s) => s.toggleSmsFollowUp);
  const toggleCapture = useReceptionistStore((s) => s.toggleCaptureField);
  const addIntent = useReceptionistStore((s) => s.addIntent);
  const removeIntent = useReceptionistStore((s) => s.removeIntent);
  const simulateCaller = useReceptionistStore((s) => s.simulateCaller);
  const resetSession = useReceptionistStore((s) => s.resetSession);

  const [label, setLabel] = React.useState("");
  const [phrases, setPhrases] = React.useState("");
  const [action, setAction] = React.useState<ReceptionistActionKind>("route_queue");
  const [utterance, setUtterance] = React.useState("");

  const open = isWithinHours(SCHEDULE);
  const detected = session.detectedIntentId
    ? config.intents.find((i) => i.id === session.detectedIntentId)
    : undefined;

  const submitIntent = () => {
    const ph = phrases.split(",").map((p) => p.trim()).filter(Boolean);
    if (!label.trim() || ph.length === 0) return;
    addIntent({ label: label.trim(), phrases: ph, action });
    setLabel("");
    setPhrases("");
  };

  const send = () => {
    if (!utterance.trim()) return;
    simulateCaller(utterance.trim());
    setUtterance("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Configuration */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Headset size={20} className="text-accent" aria-hidden />
          <h2 className="text-lg font-semibold text-fg">{t("phone.reception.title")}</h2>
          <Badge tone={config.enabled ? "positive" : "neutral"} className="ml-auto">
            {config.enabled ? t("phone.reception.on") : t("phone.reception.off")}
          </Badge>
          <Button variant="secondary" onClick={toggleEnabled}>
            {config.enabled ? t("phone.reception.disable") : t("phone.reception.enable")}
          </Button>
        </div>

        <label className="mb-1 block text-base font-medium text-fg" htmlFor="recep-greeting">
          {t("phone.reception.greeting")}
        </label>
        <textarea
          id="recep-greeting"
          rows={2}
          value={config.greeting}
          onChange={(e) => setGreeting(e.target.value)}
          className="mb-3 w-full rounded-md border border-border bg-surface p-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />

        <label className="mb-1 block text-base font-medium text-fg" htmlFor="recep-after">
          {t("phone.reception.afterHoursGreeting")}
        </label>
        <textarea
          id="recep-after"
          rows={2}
          value={config.afterHoursGreeting}
          onChange={(e) => setAfterHours(e.target.value)}
          className="mb-3 w-full rounded-md border border-border bg-surface p-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />

        <fieldset className="mb-3">
          <legend className="mb-1 text-base font-medium text-fg">{t("phone.reception.captureFields")}</legend>
          <div className="flex flex-wrap gap-3">
            {CAPTURE.map((f) => (
              <label key={f} className="inline-flex items-center gap-2 text-base text-fg">
                <input
                  type="checkbox"
                  checked={config.captureFields.includes(f)}
                  onChange={() => toggleCapture(f)}
                  className="h-4 w-4 accent-accent"
                />
                {t(`phone.reception.field.${f}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mb-4 inline-flex items-center gap-2 text-base text-fg">
          <input type="checkbox" checked={config.smsFollowUp} onChange={toggleSms} className="h-4 w-4 accent-accent" />
          {t("phone.reception.smsFollowUp")}
        </label>

        <h3 className="mb-2 text-base font-semibold text-fg">{t("phone.reception.intents")}</h3>
        <ul className="mb-3 space-y-1">
          {config.intents.map((intent) => (
            <li key={intent.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base">
              <span className="font-medium text-fg">{intent.label}</span>
              <span className="truncate text-muted">{intent.phrases.join(", ")}</span>
              <Badge tone={actionTone[intent.action]} className="ml-auto">
                {t(`phone.reception.action.${intent.action}`)}
              </Badge>
              <IconButton label={t("common.delete")} variant="ghost" onClick={() => removeIntent(intent.id)}>
                <Trash size={18} aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-end gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t("phone.reception.labelPh")}
            aria-label={t("phone.reception.labelPh")}
            className="h-11 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <input
            value={phrases}
            onChange={(e) => setPhrases(e.target.value)}
            placeholder={t("phone.reception.phrasesPh")}
            aria-label={t("phone.reception.phrasesPh")}
            className="h-11 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as ReceptionistActionKind)}
            aria-label={t("phone.reception.actionLabel")}
            className="h-11 rounded-md border border-border bg-surface px-2 text-base text-fg"
          >
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {t(`phone.reception.action.${a}`)}
              </option>
            ))}
          </select>
          <Button onClick={submitIntent}>
            <Plus size={18} aria-hidden /> {t("phone.reception.addIntent")}
          </Button>
        </div>
      </Card>

      {/* Live tester */}
      <Card>
        <div className="mb-2 flex items-center gap-2">
          <Robot size={20} className="text-accent" aria-hidden />
          <h2 className="text-lg font-semibold text-fg">{t("phone.reception.tester")}</h2>
          <Badge tone={open ? "positive" : "warning"} className="ml-auto">
            {open ? t("phone.reception.openNow") : t("phone.reception.afterHours")}
          </Badge>
        </div>
        <p className="mb-3 rounded-md bg-surface p-2 text-base text-muted">{receptionistGreeting(config, open)}</p>

        {session.turns.length === 0 ? (
          <EmptyState icon={<Headset size={28} aria-hidden />} title={t("phone.reception.empty")} hint={t("phone.reception.emptyHint")} />
        ) : (
          <ul className="mb-3 space-y-2" aria-label={t("phone.reception.transcript")}>
            {session.turns.map((turn) => (
              <li key={turn.id} className={cn("flex gap-2", turn.who === "caller" ? "flex-row-reverse" : "")}>
                <span className={cn("mt-0.5 shrink-0", turn.who === "ai" ? "text-accent" : "text-muted")}>
                  {turn.who === "ai" ? <Robot size={18} aria-hidden /> : <User size={18} aria-hidden />}
                </span>
                <span
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-1.5 text-base",
                    turn.who === "ai" ? "bg-surface text-fg" : "bg-accent text-accent-fg",
                  )}
                >
                  {turn.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        {detected || session.action ? (
          <div className="mb-3 flex items-center gap-2 text-base">
            <span className="text-muted">{t("phone.reception.detected")}:</span>
            <span className="font-medium text-fg">{detected ? detected.label : t("phone.reception.noIntent")}</span>
            {session.action ? <Badge tone={actionTone[session.action]}>{t(`phone.reception.action.${session.action}`)}</Badge> : null}
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <label htmlFor="recep-utterance" className="sr-only">
            {t("phone.reception.testerPh")}
          </label>
          <input
            id="recep-utterance"
            value={utterance}
            onChange={(e) => setUtterance(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            placeholder={t("phone.reception.testerPh")}
            className="h-11 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <IconButton label={t("phone.reception.send")} variant="primary" onClick={send} disabled={!utterance.trim()}>
            <PaperPlaneRight size={18} aria-hidden />
          </IconButton>
          <Button variant="secondary" onClick={resetSession}>
            {t("phone.reception.reset")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
