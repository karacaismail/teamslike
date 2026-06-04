import { useTranslation } from "react-i18next";
import { ChartBar, Check } from "@/lib/icons";
import { usePollStore } from "../pollStore";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export function PollOverlay() {
  const { t } = useTranslation();
  const polls = usePollStore((s) => s.polls);
  const vote = usePollStore((s) => s.vote);
  const me = useAuthStore((a) => a.principal?.id ?? "usr_1");
  const live = polls.filter((p) => p.state === "live");

  if (live.length === 0) return null;

  return (
    <Card>
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
        <ChartBar size={18} aria-hidden /> {t("webinar.polls")}
      </h3>
      <div className="space-y-3">
        {live.map((p) => {
          const total = p.options.reduce((n, o) => n + o.votes.length, 0);
          return (
            <div key={p.id}>
              <div className="mb-1 text-base font-medium text-fg">{p.question}</div>
              <ul className="space-y-1.5">
                {p.options.map((o) => {
                  const pct = total > 0 ? Math.round((o.votes.length / total) * 100) : 0;
                  const mine = o.votes.includes(me);
                  return (
                    <li key={o.id}>
                      <button
                        onClick={() => vote(p.id, o.id, me)}
                        aria-pressed={mine}
                        className={cn(
                          "relative w-full overflow-hidden rounded-md border px-3 py-2 text-left text-base",
                          mine ? "border-accent" : "border-border",
                        )}
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
              <div className="mt-1 text-base text-muted">{t("webinar.votes", { n: total })}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
