import * as React from "react";
import { useTranslation } from "react-i18next";
import { Lightning, Play, Plus, Check } from "@/lib/icons";
import { useDocsStore } from "../docsStore";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { WorkflowTrigger } from "../types";

const TRIGGERS: WorkflowTrigger[] = ["message", "schedule", "reaction"];

export function WorkflowBuilder() {
  const { t } = useTranslation();
  const workflows = useDocsStore((s) => s.workflows);
  const lastRun = useDocsStore((s) => s.lastRun);
  const { runWorkflow, addWorkflow } = useDocsStore.getState();
  const [sel, setSel] = React.useState(workflows[0]?.id ?? "");
  const [name, setName] = React.useState("");
  const [trigger, setTrigger] = React.useState<WorkflowTrigger>("message");

  const wf = workflows.find((w) => w.id === sel) ?? workflows[0];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-3 lg:col-span-1">
        <h3 className="mb-2 text-base font-semibold text-fg">{t("docs.workflows")}</h3>
        <ul className="space-y-1">
          {workflows.map((w) => (
            <li key={w.id}>
              <button
                onClick={() => setSel(w.id)}
                aria-current={wf?.id === w.id}
                className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-base", wf?.id === w.id ? "bg-surface text-fg" : "text-muted hover:bg-surface")}
              >
                <Lightning size={16} aria-hidden /> {w.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("docs.workflowName")} aria-label={t("docs.workflowName")} className="h-10 w-full rounded-md border border-border bg-bg px-2 text-base text-fg outline-none" />
          <select value={trigger} onChange={(e) => setTrigger(e.target.value as WorkflowTrigger)} aria-label={t("docs.triggerLabel")} className="h-10 w-full rounded-md border border-border bg-bg px-2 text-base text-fg">
            {TRIGGERS.map((tr) => <option key={tr} value={tr}>{t(`docs.trigger.${tr}`)}</option>)}
          </select>
          <Button className="w-full" disabled={!name.trim()} onClick={() => { addWorkflow(name.trim(), trigger); setName(""); }}>
            <Plus size={16} aria-hidden /> {t("docs.addWorkflow")}
          </Button>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        {wf ? (
          <>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-base font-semibold text-fg">{wf.name}</h3>
              <Badge tone="accent">{t(`docs.trigger.${wf.trigger}`)}</Badge>
              <Button className="ml-auto" onClick={() => runWorkflow(wf.id)}>
                <Play size={16} aria-hidden /> {t("docs.run")}
              </Button>
            </div>
            <ol className="space-y-1">
              {wf.steps.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base">
                  <span className="text-muted">{i + 1}.</span>
                  <span className="font-medium text-fg">{t(`docs.stepKind.${s.kind}`)}</span>
                  <span className="truncate text-muted">{s.value}</span>
                </li>
              ))}
              {wf.steps.length === 0 ? <li className="text-base text-muted">{t("docs.noSteps")}</li> : null}
            </ol>

            {lastRun ? (
              <div className="mt-3 rounded-md border border-positive bg-surface p-2">
                <div className="mb-1 text-base font-medium text-positive">{t("docs.runLog")}</div>
                <ul className="space-y-0.5">
                  {lastRun.map((r) => (
                    <li key={r.id} className="flex items-center gap-1 text-base text-fg">
                      <Check size={14} className="text-positive" aria-hidden /> {r.label}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : null}
      </Card>
    </div>
  );
}
