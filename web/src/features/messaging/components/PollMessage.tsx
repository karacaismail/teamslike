import { useTranslation } from "react-i18next";
import { ChartBar, Check, X } from "@/lib/icons";
import { useMessagingStore } from "../store";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { Message } from "../types";

/** Poll / quiz message (Telegram/WhatsApp/Teams/Zoom/Meet clone). */
export function PollMessage({ message }: { message: Message }) {
  const { t } = useTranslation();
  const me = useAuthStore((s) => s.principal?.id ?? "usr_1");
  const { vote, closePoll } = useMessagingStore();
  const poll = message.poll!;
  const total = poll.options.reduce((n, o) => n + o.votes.length, 0);
  const owner = message.authorId === me;

  return (
    <div className="max-w-md rounded-lg border border-border bg-bg p-3">
      <div className="mb-2 flex items-center gap-2 text-base text-muted">
        <ChartBar size={16} aria-hidden />
        {poll.quiz ? t("messaging.poll.quiz") : poll.anonymous ? t("messaging.poll.anonymous") : t("messaging.poll.public")}
        {poll.multi ? ` · ${t("messaging.poll.multi")}` : ""}
        {poll.closed ? ` · ${t("messaging.poll.closed")}` : ""}
      </div>
      <div className="mb-2 text-base font-semibold text-fg">{poll.question}</div>

      <ul className="space-y-1.5">
        {poll.options.map((o) => {
          const pct = total > 0 ? Math.round((o.votes.length / total) * 100) : 0;
          const mine = o.votes.includes(me);
          const isCorrect = poll.quiz && poll.closed && poll.correctOptionId === o.id;
          return (
            <li key={o.id}>
              <button
                onClick={() => vote(message.id, o.id, me)}
                disabled={poll.closed}
                aria-pressed={mine}
                className={cn(
                  "relative w-full overflow-hidden rounded-md border px-3 py-2 text-left text-base",
                  mine ? "border-accent" : "border-border",
                  poll.closed ? "cursor-default" : "hover:border-accent",
                )}
              >
                <span
                  className={cn("absolute inset-y-0 left-0", isCorrect ? "bg-positive/25" : "bg-surface")}
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
                <span className="relative flex items-center gap-2">
                  {mine ? <Check size={16} className="text-accent" aria-hidden /> : null}
                  <span className="flex-1 text-fg">{o.text}</span>
                  <span className="text-muted">{pct}%</span>
                  <span className="w-8 text-right text-muted">{o.votes.length}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-2 flex items-center justify-between text-base text-muted">
        <span>{t("messaging.poll.votes", { n: total })}</span>
        {owner && !poll.closed ? (
          <Button variant="ghost" onClick={() => closePoll(message.id)}>
            <X size={16} aria-hidden />
            {t("messaging.poll.close")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
