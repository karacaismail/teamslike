import { useTranslation } from "react-i18next";
import { Headset, Clock, PhoneCall } from "@/lib/icons";
import { usePbxStore } from "../pbxStore";
import { estimatedWaitSec } from "../pbx";
import { useToastStore } from "@/store/toastStore";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

/** Receptionist / attendant console: queue KPIs + agent presence + next pickup. */
export function AttendantConsole() {
  const { t } = useTranslation();
  const queues = usePbxStore((s) => s.queues);
  const assignNext = usePbxStore((s) => s.assignNext);
  const push = useToastStore((s) => s.push);

  const assign = (queueId: string) => {
    const res = assignNext(queueId);
    push(
      res
        ? { title: t("phone.queue.assigned", { agent: res.agent.name }), tone: "positive" }
        : { title: t("phone.queue.empty"), tone: "neutral" },
    );
  };

  return (
    <Card>
      <h3 className="mb-3 flex items-center gap-1 text-base font-semibold text-fg">
        <Headset size={18} aria-hidden /> {t("phone.attendant.title")}
      </h3>
      <table className="w-full border-collapse text-base">
        <thead>
          <tr className="text-muted">
            <th className="py-1 text-left font-medium">{t("phone.attendant.queue")}</th>
            <th className="py-1 text-right font-medium">{t("phone.attendant.waiting")}</th>
            <th className="py-1 text-right font-medium">{t("phone.attendant.wait")}</th>
            <th className="py-1 text-left font-medium">{t("phone.attendant.agents")}</th>
            <th className="py-1" />
          </tr>
        </thead>
        <tbody>
          {queues.map((q) => {
            const avail = q.agents.filter((a) => a.available).length;
            return (
              <tr key={q.id} className="border-t border-border align-middle">
                <td className="py-2 text-fg">{q.name}</td>
                <td className="py-2 text-right tabular-nums text-fg">{q.waiting.length}</td>
                <td className="py-2 text-right">
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Clock size={13} aria-hidden /> {Math.round(estimatedWaitSec(q) / 60)}m
                  </span>
                </td>
                <td className="py-2">
                  <span className="flex flex-wrap items-center gap-1.5">
                    {q.agents.map((a) => (
                      <span key={a.id} className="inline-flex items-center gap-1 text-base text-muted" title={a.name}>
                        <span className={cn("h-2 w-2 rounded-full", a.available ? "bg-positive" : "bg-muted")} aria-hidden />
                        {a.name.split(" ")[0]}
                      </span>
                    ))}
                    <Badge tone={avail > 0 ? "positive" : "danger"}>{t("phone.attendant.available", { n: avail })}</Badge>
                  </span>
                </td>
                <td className="py-2 text-right">
                  <Button variant="secondary" disabled={q.waiting.length === 0} onClick={() => assign(q.id)}>
                    <PhoneCall size={16} aria-hidden /> {t("phone.queue.assignNext")}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
