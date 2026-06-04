import * as React from "react";
import { useTranslation } from "react-i18next";
import { X, ChartBar, Question, ArrowFatUp, Check, Plus, PaperPlaneRight, Sparkle } from "@/lib/icons";
import { useMeetingStore } from "../store";
import { useAuthStore } from "@/store/authStore";
import { memberName } from "@/lib/identity";
import { useOpenIntelligence } from "@/features/integration";
import { Button, IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { RecordingSummaryDialog } from "./RecordingSummaryDialog";

export function EngagePanel() {
  const { t } = useTranslation();
  const s = useMeetingStore();
  const me = useAuthStore((a) => a.principal?.id ?? "usr_1");
  const self = s.participants.find((p) => p.isSelf);
  const isHost = self?.role === "host" || self?.role === "cohost";

  const openIntel = useOpenIntelligence();
  const [recapOpen, setRecapOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [pollQ, setPollQ] = React.useState("");
  const [pollOpts, setPollOpts] = React.useState(["", ""]);

  if (s.sidePanel !== "engage") return null;

  const poll = s.meetingPoll;
  const total = poll ? poll.options.reduce((n, o) => n + o.votes.length, 0) : 0;
  const sortedQna = s.qna.slice().sort((a, b) => b.upvotes.length - a.upvotes.length);

  return (
    <aside aria-label={t("meetings.engage")} className="flex w-80 shrink-0 flex-col border-l border-border bg-surface">
      <header className="flex items-center justify-between border-b border-border p-3">
        <span className="text-base font-semibold text-fg">{t("meetings.engage")}</span>
        <IconButton label={t("meetings.closePanel")} onClick={() => s.setSidePanel("none")}>
          <X size={20} aria-hidden />
        </IconButton>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        {/* Poll */}
        <section>
          <h3 className="mb-1 flex items-center gap-1 text-base font-semibold text-muted">
            <ChartBar size={16} aria-hidden /> {t("meetings.poll")}
          </h3>
          {poll ? (
            <div className="rounded-md border border-border bg-bg p-2">
              <div className="mb-2 text-base font-semibold text-fg">{poll.question}</div>
              <ul className="space-y-1.5">
                {poll.options.map((o) => {
                  const pct = total > 0 ? Math.round((o.votes.length / total) * 100) : 0;
                  const mine = o.votes.includes(me);
                  return (
                    <li key={o.id}>
                      <button
                        onClick={() => s.votePoll(o.id, me)}
                        disabled={poll.closed}
                        aria-pressed={mine}
                        className={cn("relative w-full overflow-hidden rounded-md border px-3 py-2 text-left text-base", mine ? "border-accent" : "border-border")}
                      >
                        <span className="absolute inset-y-0 left-0 bg-surface" style={{ width: `${pct}%` }} aria-hidden />
                        <span className="relative flex items-center gap-2">
                          {mine ? <Check size={16} className="text-accent" aria-hidden /> : null}
                          <span className="flex-1 text-fg">{o.text}</span>
                          <span className="text-muted">{pct}%</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 flex items-center justify-between text-base text-muted">
                <span>{t("messaging.poll.votes", { n: total })}</span>
                {isHost && !poll.closed ? (
                  <Button variant="ghost" onClick={s.closeMeetingPoll}>{t("meetings.poll.close")}</Button>
                ) : null}
              </div>
            </div>
          ) : isHost ? (
            <div className="space-y-2 rounded-md border border-border bg-bg p-2">
              <input
                value={pollQ}
                onChange={(e) => setPollQ(e.target.value)}
                placeholder={t("meetings.poll.questionPh")}
                className="h-10 w-full rounded-md border border-border bg-bg px-2 text-base text-fg outline-none"
              />
              {pollOpts.map((o, i) => (
                <input
                  key={i}
                  value={o}
                  onChange={(e) => setPollOpts(pollOpts.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={`${t("meetings.poll.option")} ${i + 1}`}
                  className="h-10 w-full rounded-md border border-border bg-bg px-2 text-base text-fg outline-none"
                />
              ))}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setPollOpts([...pollOpts, ""])}>
                  <Plus size={16} aria-hidden /> {t("meetings.poll.addOption")}
                </Button>
                <Button
                  className="ml-auto"
                  disabled={!pollQ.trim() || pollOpts.filter((o) => o.trim()).length < 2}
                  onClick={() => {
                    s.launchPoll(pollQ, pollOpts);
                    setPollQ("");
                    setPollOpts(["", ""]);
                  }}
                >
                  {t("meetings.poll.launch")}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-base text-muted">{t("meetings.poll.none")}</p>
          )}
        </section>

        {/* Q&A */}
        <section>
          <h3 className="mb-1 flex items-center gap-1 text-base font-semibold text-muted">
            <Question size={16} aria-hidden /> {t("meetings.qna")}
          </h3>
          <div className="mb-2 flex items-end gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && question.trim()) {
                  s.askQuestion(question, me);
                  setQuestion("");
                }
              }}
              placeholder={t("meetings.qnaPlaceholder")}
              aria-label={t("meetings.qnaPlaceholder")}
              className="h-10 flex-1 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none"
            />
            <IconButton
              label={t("meetings.qnaAsk")}
              variant="primary"
              disabled={!question.trim()}
              onClick={() => {
                if (!question.trim()) return;
                s.askQuestion(question, me);
                setQuestion("");
              }}
            >
              <PaperPlaneRight size={18} aria-hidden />
            </IconButton>
          </div>
          <ul className="space-y-2">
            {sortedQna.map((q) => {
              const up = q.upvotes.includes(me);
              return (
                <li key={q.id} className={cn("rounded-md border border-border p-2", q.answered && "opacity-60")}>
                  <div className="text-base text-fg">{q.text}</div>
                  <div className="mt-1 flex items-center gap-2 text-base text-muted">
                    <span className="flex-1 truncate">{memberName(q.authorId)}</span>
                    {q.answered ? <span className="text-positive">{t("meetings.qnaAnswered")}</span> : null}
                    {isHost && !q.answered ? (
                      <button onClick={() => s.answerQuestion(q.id)} className="rounded-md px-2 py-0.5 text-accent hover:bg-raised">
                        {t("meetings.qnaAnswer")}
                      </button>
                    ) : null}
                    <button
                      onClick={() => s.upvoteQuestion(q.id, me)}
                      aria-pressed={up}
                      className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5", up ? "border-accent text-accent" : "border-border text-muted")}
                    >
                      <ArrowFatUp size={14} weight={up ? "fill" : "regular"} aria-hidden /> {q.upvotes.length}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Recap */}
        <section>
          <h3 className="mb-1 flex items-center gap-1 text-base font-semibold text-muted">
            <Sparkle size={16} aria-hidden /> {t("meetings.recap")}
          </h3>
          <Button variant="secondary" className="w-full" onClick={() => setRecapOpen(true)}>
            {t("meetings.viewRecap")}
          </Button>
          <Button variant="ghost" className="mt-2 w-full" onClick={() => openIntel("src_standup")}>
            {t("intel.openIntelligence")}
          </Button>
        </section>
      </div>

      <RecordingSummaryDialog open={recapOpen} onOpenChange={setRecapOpen} />
    </aside>
  );
}
