import * as React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash } from "@/lib/icons";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/primitives";
import { useMessagingStore } from "../store";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/cn";

export function CreatePollDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const me = useAuthStore((s) => s.principal?.id ?? "usr_1");
  const createPoll = useMessagingStore((s) => s.createPoll);

  const [question, setQuestion] = React.useState("");
  const [options, setOptions] = React.useState(["", ""]);
  const [multi, setMulti] = React.useState(false);
  const [anonymous, setAnonymous] = React.useState(false);
  const [quiz, setQuiz] = React.useState(false);
  const [correctIndex, setCorrectIndex] = React.useState(0);

  const valid = question.trim() && options.filter((o) => o.trim()).length >= 2;

  const reset = () => {
    setQuestion("");
    setOptions(["", ""]);
    setMulti(false);
    setAnonymous(false);
    setQuiz(false);
    setCorrectIndex(0);
  };

  const submit = () => {
    if (!valid) return;
    createPoll(question, options, { multi, anonymous, quiz, correctIndex }, me);
    reset();
    onOpenChange(false);
  };

  const Toggle = ({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) => (
    <button
      onClick={() => set(!on)}
      aria-pressed={on}
      className={cn(
        "h-9 rounded-md border px-3 text-base",
        on ? "border-accent bg-surface text-accent" : "border-border bg-raised text-muted",
      )}
    >
      {label}
    </button>
  );

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("messaging.poll.create")}>
      <div className="space-y-3 p-5">
        <label className="block">
          <span className="mb-1 block text-base text-muted">{t("messaging.poll.question")}</span>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-bg px-3 text-base text-fg outline-none"
            placeholder={t("messaging.poll.questionPh")}
          />
        </label>

        <div className="space-y-2">
          <span className="block text-base text-muted">{t("messaging.poll.options")}</span>
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              {quiz ? (
                <input
                  type="radio"
                  name="correct"
                  checked={correctIndex === i}
                  onChange={() => setCorrectIndex(i)}
                  aria-label={t("messaging.poll.correct")}
                  className="h-5 w-5"
                />
              ) : null}
              <input
                value={o}
                onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))}
                className="h-11 flex-1 rounded-md border border-border bg-bg px-3 text-base text-fg outline-none"
                placeholder={`${t("messaging.poll.option")} ${i + 1}`}
              />
              {options.length > 2 ? (
                <button
                  onClick={() => setOptions(options.filter((_, j) => j !== i))}
                  aria-label={t("messaging.poll.removeOption")}
                  className="rounded-md p-2 text-muted hover:bg-surface"
                >
                  <Trash size={18} aria-hidden />
                </button>
              ) : null}
            </div>
          ))}
          <Button variant="ghost" onClick={() => setOptions([...options, ""])}>
            <Plus size={16} aria-hidden />
            {t("messaging.poll.addOption")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Toggle on={multi} set={setMulti} label={t("messaging.poll.multi")} />
          <Toggle on={anonymous} set={setAnonymous} label={t("messaging.poll.anonymous")} />
          <Toggle on={quiz} set={setQuiz} label={t("messaging.poll.quiz")} />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("messaging.cancel")}
          </Button>
          <Button onClick={submit} disabled={!valid}>
            {t("messaging.poll.send")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
