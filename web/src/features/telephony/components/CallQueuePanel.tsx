import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UsersThree, PhoneCall, UserPlus, HandGrabbing, Clock, PhoneOutgoing } from "@/lib/icons";
import { usePbxStore } from "../pbxStore";
import { useCallStore } from "../callStore";
import { useToastStore } from "@/store/toastStore";
import { CONTACTS } from "../data";
import { callerName } from "../routing";
import { isWithinHours, estimatedWaitSec } from "../pbx";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export function CallQueuePanel() {
  const { t } = useTranslation();
  const queues = usePbxStore((s) => s.queues);
  const schedule = usePbxStore((s) => s.schedule);
  const open = isWithinHours(schedule);
  const enqueue = usePbxStore((s) => s.enqueue);
  const assignNext = usePbxStore((s) => s.assignNext);
  const assignBySkill = usePbxStore((s) => s.assignNextBySkill);
  const groupPickup = usePbxStore((s) => s.groupPickup);
  const requestCallback = usePbxStore((s) => s.requestCallback);
  const huntGroups = usePbxStore((s) => s.huntGroups);
  const ringHunt = usePbxStore((s) => s.ringHunt);
  const simulateInbound = useCallStore((s) => s.simulateInbound);
  const answer = useCallStore((s) => s.answer);
  const push = useToastStore((s) => s.push);
  const [skillByQueue, setSkillByQueue] = useState<Record<string, string>>({});

  const pickup = (queueId: string) => {
    const call = groupPickup(queueId);
    if (!call) return;
    simulateInbound(call.from); // the picker now owns the call
    answer();
    push({ title: t("phone.queue.pickedUp", { from: callerName(call.from, CONTACTS) }), tone: "positive" });
  };

  const assign = (queueId: string) => {
    const res = assignNext(queueId);
    if (res) push({ title: t("phone.queue.assigned", { agent: res.agent.name }), tone: "positive" });
  };

  const assignSkill = (queueId: string, skill: string) => {
    const res = assignBySkill(queueId, skill);
    push(
      res
        ? { title: t("phone.queue.assigned", { agent: res.agent.name }), tone: "positive" }
        : { title: t("phone.queue.noAgent"), tone: "danger" },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-md border border-border bg-raised px-3 py-2">
        <Clock size={18} className="text-muted" aria-hidden />
        <span className="flex-1 text-base text-fg">{schedule.name}</span>
        <Badge tone={open ? "positive" : "neutral"}>{open ? t("phone.hours.open") : t("phone.hours.closed")}</Badge>
      </div>
      {queues.map((q) => (
        <Card key={q.id}>
          <div className="mb-2 flex items-center gap-2">
            <UsersThree size={18} className="text-muted" aria-hidden />
            <span className="text-base font-semibold text-fg">{q.name}</span>
            <Badge tone="accent">{t(`phone.queue.strategy.${q.strategy}`)}</Badge>
            <span className="ml-auto flex items-center gap-2 text-base text-muted">
              <Clock size={14} aria-hidden /> {t("phone.queue.estWait", { n: Math.round(estimatedWaitSec(q) / 60) })}
              · {t("phone.queue.waiting", { n: q.waiting.length })}
            </span>
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {q.agents.map((a) => (
              <span
                key={a.id}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-base",
                  a.available ? "border-positive text-fg" : "border-border text-muted",
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", a.available ? "bg-positive" : "bg-muted")} aria-hidden />
                {a.name}
                {a.skills?.length ? <span className="text-muted">· {a.skills.join(", ")}</span> : null}
              </span>
            ))}
          </div>

          {q.waiting.length > 0 ? (
            <ul className="mb-3 space-y-1">
              {q.waiting.map((w) => (
                <li key={w.id} className="flex items-center gap-2 text-base text-muted">
                  <PhoneCall size={14} aria-hidden /> {callerName(w.from, CONTACTS)}
                  {w.callbackRequested ? (
                    <Badge tone="accent"><PhoneOutgoing size={12} aria-hidden /> {t("phone.queue.callbackQueued")}</Badge>
                  ) : (
                    <button onClick={() => requestCallback(q.id, w.id)} className="ml-auto inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-base text-muted hover:bg-surface">
                      <PhoneOutgoing size={12} aria-hidden /> {t("phone.queue.callback")}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 text-base text-muted">{t("phone.queue.empty")}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => enqueue(q.id, "+19995550000")}>
              <UserPlus size={16} aria-hidden /> {t("phone.queue.simulate")}
            </Button>
            <Button disabled={q.waiting.length === 0} onClick={() => assign(q.id)}>
              {t("phone.queue.assignNext")}
            </Button>
            <Button variant="secondary" disabled={q.waiting.length === 0} onClick={() => pickup(q.id)}>
              <HandGrabbing size={16} aria-hidden /> {t("phone.queue.groupPickup")}
            </Button>
            {(() => {
              const skills = Array.from(new Set(q.agents.flatMap((a) => a.skills ?? [])));
              const sel = skillByQueue[q.id] ?? skills[0] ?? "";
              return skills.length ? (
                <span className="ml-auto flex items-center gap-2">
                  <select
                    value={sel}
                    onChange={(e) => setSkillByQueue((m) => ({ ...m, [q.id]: e.target.value }))}
                    aria-label={t("phone.queue.skill")}
                    className="h-11 rounded-md border border-border bg-bg px-2 text-base text-fg"
                  >
                    {skills.map((sk) => <option key={sk} value={sk}>{sk}</option>)}
                  </select>
                  <Button variant="secondary" disabled={q.waiting.length === 0} onClick={() => assignSkill(q.id, sel)}>
                    {t("phone.queue.assignBySkill")}
                  </Button>
                </span>
              ) : null;
            })()}
          </div>
        </Card>
      ))}

      {huntGroups.length > 0 ? (
        <Card>
          <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
            <UsersThree size={18} aria-hidden /> {t("phone.hunt.title")}
          </h3>
          <ul className="space-y-2">
            {huntGroups.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border px-3 py-2">
                <span className="text-base font-medium text-fg">{g.name}</span>
                <Badge tone="neutral">{t(`phone.hunt.ring.${g.ring}`)}</Badge>
                <span className="flex flex-wrap items-center gap-1.5">
                  {g.members.map((m) => (
                    <span key={m.id} className="inline-flex items-center gap-1 text-base text-muted">
                      <span className={cn("h-2 w-2 rounded-full", m.available ? "bg-positive" : "bg-muted")} aria-hidden />
                      {m.name}
                    </span>
                  ))}
                </span>
                <Button
                  variant="secondary"
                  className="ml-auto"
                  onClick={() => {
                    const m = ringHunt(g.id);
                    push(m ? { title: t("phone.hunt.rang", { name: m.name }), tone: "positive" } : { title: t("phone.queue.noAgent"), tone: "danger" });
                  }}
                >
                  <PhoneCall size={16} aria-hidden /> {t("phone.hunt.ring2")}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
