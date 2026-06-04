import * as React from "react";
import { useTranslation } from "react-i18next";
import { ClipboardText } from "@/lib/icons";
import { useCallStore } from "../callStore";
import { CONTACTS } from "../data";
import { callerName } from "../routing";
import { Button, Card } from "@/components/ui/primitives";
import type { CallOutcome } from "../types";

const OUTCOMES: CallOutcome[] = ["resolved", "follow_up", "no_answer", "sale", "spam"];

/** After-call wrap-up — disposition + note + tags synced to the customer profile. */
export function WrapUpCard() {
  const { t } = useTranslation();
  const wrap = useCallStore((s) => s.pendingWrapUp);
  const { saveDisposition, dismissWrapUp } = useCallStore.getState();
  const [outcome, setOutcome] = React.useState<CallOutcome>("resolved");
  const [note, setNote] = React.useState("");
  const [tags, setTags] = React.useState("");

  if (!wrap) return null;
  const remote = wrap.direction === "outbound" ? wrap.to : wrap.from;

  const save = () => {
    saveDisposition({
      callId: wrap.id,
      outcome,
      note: note.trim(),
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setNote("");
    setTags("");
    setOutcome("resolved");
  };

  return (
    <Card className="shadow-xl">
      <div className="mb-2 flex items-center gap-2">
        <ClipboardText size={18} className="text-accent" aria-hidden />
        <span className="text-base font-semibold text-fg">{t("phone.wrapUp.title")}</span>
        <span className="text-base text-muted">· {callerName(remote, CONTACTS)}</span>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-base text-muted">
          {t("phone.wrapUp.outcome")}
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as CallOutcome)}
            className="h-11 rounded-md border border-border bg-bg px-2 text-base text-fg"
          >
            {OUTCOMES.map((o) => (
              <option key={o} value={o}>{t(`phone.wrapUp.outcomeLabel.${o}`)}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-base text-muted">
          {t("phone.wrapUp.note")}
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-bg px-2 text-base text-fg outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-base text-muted">
          {t("phone.wrapUp.tags")}
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="vip, renewal"
            className="h-11 w-36 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none placeholder:text-muted"
          />
        </label>
        <Button onClick={save}>{t("phone.wrapUp.save")}</Button>
        <Button variant="ghost" onClick={dismissWrapUp}>{t("phone.wrapUp.skip")}</Button>
      </div>
    </Card>
  );
}
