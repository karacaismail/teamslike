import * as React from "react";
import { useTranslation } from "react-i18next";
import { Question, ArrowFatUp, Check, PaperPlaneRight } from "@/lib/icons";
import { useQnaStore } from "../qnaStore";
import { useAuthStore } from "@/store/authStore";
import { sortQna } from "../webinar";
import { Card, IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export function QnaBoard() {
  const { t } = useTranslation();
  const items = useQnaStore((s) => s.items);
  const { ask, upvote, answer } = useQnaStore.getState();
  const me = useAuthStore((a) => a.principal?.id ?? "usr_1");
  const canModerate = useAuthStore((a) => a.can("admin.access"));
  const [text, setText] = React.useState("");
  const sorted = sortQna(items);

  const submit = () => {
    if (!text.trim()) return;
    ask(text.trim(), me);
    setText("");
  };

  return (
    <Card>
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
        <Question size={18} aria-hidden /> {t("webinar.qna")}
      </h3>
      <div className="mb-2 flex items-end gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={t("webinar.qnaPlaceholder")}
          aria-label={t("webinar.qnaPlaceholder")}
          className="h-11 flex-1 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none placeholder:text-muted"
        />
        <IconButton label={t("webinar.ask")} variant="primary" disabled={!text.trim()} onClick={submit}>
          <PaperPlaneRight size={18} aria-hidden />
        </IconButton>
      </div>
      <ul className="space-y-2" role="feed" aria-label={t("webinar.qna")}>
        {sorted.map((q) => {
          const up = q.upvotes.includes(me);
          return (
            <li key={q.id} className={cn("rounded-md border border-border p-2", q.answered && "opacity-60")}>
              <div className="text-base text-fg">{q.text}</div>
              <div className="mt-1 flex items-center gap-2 text-base text-muted">
                {q.answered ? <span className="text-positive">{t("webinar.answered")}</span> : null}
                {canModerate && !q.answered ? (
                  <button onClick={() => answer(q.id)} className="rounded-md px-2 py-0.5 text-accent hover:bg-raised">
                    {t("webinar.markAnswered")}
                  </button>
                ) : null}
                <button
                  onClick={() => upvote(q.id, me)}
                  aria-pressed={up}
                  className={cn(
                    "ml-auto inline-flex items-center gap-1 rounded-md border px-2 py-0.5",
                    up ? "border-accent text-accent" : "border-border text-muted",
                  )}
                >
                  <ArrowFatUp size={14} weight={up ? "fill" : "regular"} aria-hidden /> {q.upvotes.length}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
