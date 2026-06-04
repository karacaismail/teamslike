import * as React from "react";
import { useTranslation } from "react-i18next";
import { ChatText, Question, ClipboardText, GitBranch, UserSwitch, Flag, Plus, Trash, Play } from "@/lib/icons";
import { useBotflowStore, activeFlow } from "../botflowStore";
import { traverse, nodeById, flowStats, danglingTargets, type BotNodeKind } from "../botflow";
import { Badge, Button, Card, IconButton } from "@/components/ui/primitives";

const KIND_ICON: Record<BotNodeKind, React.ReactNode> = {
  message: <ChatText size={16} aria-hidden />,
  question: <Question size={16} aria-hidden />,
  collect: <ClipboardText size={16} aria-hidden />,
  condition: <GitBranch size={16} aria-hidden />,
  handoff: <UserSwitch size={16} aria-hidden />,
  end: <Flag size={16} aria-hidden />,
};

const ADDABLE: BotNodeKind[] = ["message", "question", "collect", "condition", "handoff", "end"];

/** No-code chatbot flow builder + WhatsApp Flows (collect nodes). */
export function FlowBuilder() {
  const { t } = useTranslation();
  const flow = useBotflowStore(activeFlow);
  const flows = useBotflowStore((s) => s.flows);
  const setActiveFlow = useBotflowStore((s) => s.setActiveFlow);
  const addNode = useBotflowStore((s) => s.addNode);
  const removeNode = useBotflowStore((s) => s.removeNode);
  const [path, setPath] = React.useState<string[]>([]);

  const stats = flowStats(flow);
  const dangling = danglingTargets(flow);

  // Default answers: take the first option at each question node.
  const simulate = () => {
    const answers: Record<string, string> = {};
    for (const n of flow.nodes) if (n.kind === "question" && n.options?.[0]) answers[n.id] = n.options[0].label;
    setPath(traverse(flow, answers));
  };

  return (
    <Card>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-1 text-base font-semibold text-fg">
          <GitBranch size={18} aria-hidden /> {t("support.flow.title")}
        </h3>
        <select
          value={flow.id}
          onChange={(e) => setActiveFlow(e.target.value)}
          aria-label={t("support.flow.title")}
          className="h-9 rounded-md border border-border bg-bg px-2 text-base text-fg"
        >
          {flows.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <span className="ml-auto text-base text-muted">
          {Object.entries(stats).filter(([, n]) => n > 0).map(([k, n]) => `${t(`support.flow.kind.${k}`)} ${n}`).join(" · ")}
        </span>
      </div>

      {dangling.length > 0 ? (
        <p className="mb-2 rounded-md border border-danger px-3 py-1.5 text-base text-danger" aria-live="polite">
          {t("support.flow.dangling", { n: dangling.length })}
        </p>
      ) : null}

      <ul className="space-y-1">
        {flow.nodes.map((n) => (
          <li key={n.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base">
            <span className="text-muted">{KIND_ICON[n.kind]}</span>
            <Badge tone="neutral">{t(`support.flow.kind.${n.kind}`)}</Badge>
            <span className="min-w-0 flex-1 truncate text-fg">{n.text}</span>
            {n.id === flow.startId ? <Badge tone="accent">{t("support.flow.start")}</Badge> : null}
            {n.kind === "collect" ? <Badge tone="accent">{t("support.flow.waFlow")}</Badge> : null}
            <IconButton label={t("support.flow.remove")} onClick={() => removeNode(n.id)}>
              <Trash size={16} aria-hidden />
            </IconButton>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
        {ADDABLE.map((k) => (
          <Button key={k} variant="secondary" onClick={() => addNode(k)}>
            <Plus size={14} aria-hidden /> {t(`support.flow.kind.${k}`)}
          </Button>
        ))}
        <Button className="ml-auto" onClick={simulate}>
          <Play size={16} aria-hidden /> {t("support.flow.simulate")}
        </Button>
      </div>

      {path.length > 0 ? (
        <p className="mt-2 text-base text-muted" aria-live="polite">
          {t("support.flow.path")}: {path.map((id) => nodeById(flow, id)?.text ?? id).join(" → ")}
        </p>
      ) : null}
    </Card>
  );
}
