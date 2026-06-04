import * as React from "react";
import { useTranslation } from "react-i18next";
import { Robot, Plus, Trash, PaperPlaneRight, Rocket, CheckCircle, User } from "@/lib/icons";
import { useStudioStore } from "../studioStore";
import { agentReady, resolutionRate } from "../studio";
import { Badge, Button, Card, EmptyState, IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { AgentChannel } from "../types";

const CHANNELS: AgentChannel[] = ["webchat", "whatsapp", "voice", "email"];
const statusTone = { draft: "neutral", testing: "warning", published: "positive" } as const;

export function AgentStudio() {
  const { t } = useTranslation();
  const agents = useStudioStore((s) => s.agents);
  const activeId = useStudioStore((s) => s.activeAgentId);
  const testLog = useStudioStore((s) => s.testLog);
  const selectAgent = useStudioStore((s) => s.selectAgent);
  const createAgent = useStudioStore((s) => s.createAgent);
  const setName = useStudioStore((s) => s.setName);
  const setGoal = useStudioStore((s) => s.setGoal);
  const toggleChannel = useStudioStore((s) => s.toggleChannel);
  const toggleTool = useStudioStore((s) => s.toggleTool);
  const addIntent = useStudioStore((s) => s.addIntent);
  const removeIntent = useStudioStore((s) => s.removeIntent);
  const publish = useStudioStore((s) => s.publish);
  const runTest = useStudioStore((s) => s.runTest);

  const agent = agents.find((a) => a.id === activeId)!;
  const ready = agentReady(agent);
  const rate = Math.round(resolutionRate(agent) * 100);

  const [newName, setNewName] = React.useState("");
  const [intentLabel, setIntentLabel] = React.useState("");
  const [intentPhrases, setIntentPhrases] = React.useState("");
  const [intentReply, setIntentReply] = React.useState("");
  const [utterance, setUtterance] = React.useState("");

  const submitIntent = () => {
    const phrases = intentPhrases.split(",").map((p) => p.trim()).filter(Boolean);
    if (!intentLabel.trim() || phrases.length === 0 || !intentReply.trim()) return;
    addIntent({ label: intentLabel.trim(), phrases, reply: intentReply.trim() });
    setIntentLabel("");
    setIntentPhrases("");
    setIntentReply("");
  };

  const send = () => {
    if (!utterance.trim()) return;
    runTest(utterance.trim());
    setUtterance("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_1fr_20rem]">
      {/* Agent list */}
      <Card>
        <div className="mb-2 flex items-center gap-2">
          <Robot size={20} className="text-accent" aria-hidden />
          <h2 className="text-lg font-semibold text-fg">{t("support.studio.agents")}</h2>
        </div>
        <ul className="mb-3 space-y-1">
          {agents.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => selectAgent(a.id)}
                aria-current={a.id === activeId}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  a.id === activeId ? "bg-accent text-accent-fg" : "text-fg hover:bg-surface",
                )}
              >
                <span className="flex-1 truncate">{a.name}</span>
                <Badge tone={statusTone[a.status]}>{t(`support.studio.status.${a.status}`)}</Badge>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-end gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("support.studio.newAgentPh")}
            aria-label={t("support.studio.newAgentPh")}
            className="h-11 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <IconButton
            label={t("support.studio.create")}
            variant="primary"
            onClick={() => {
              createAgent(newName);
              setNewName("");
            }}
          >
            <Plus size={18} aria-hidden />
          </IconButton>
        </div>
      </Card>

      {/* Design */}
      <Card>
        <label className="mb-1 block text-base font-medium text-fg" htmlFor="ag-name">
          {t("support.studio.name")}
        </label>
        <input
          id="ag-name"
          value={agent.name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-md border border-border bg-surface px-2 py-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />

        <label className="mb-1 block text-base font-medium text-fg" htmlFor="ag-goal">
          {t("support.studio.goal")}
        </label>
        <textarea
          id="ag-goal"
          rows={2}
          value={agent.goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder={t("support.studio.goalPh")}
          className="mb-3 w-full rounded-md border border-border bg-surface p-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />

        <fieldset className="mb-3">
          <legend className="mb-1 text-base font-medium text-fg">{t("support.studio.channels")}</legend>
          <div className="flex flex-wrap gap-3">
            {CHANNELS.map((c) => (
              <label key={c} className="inline-flex items-center gap-2 text-base text-fg">
                <input type="checkbox" checked={agent.channels.includes(c)} onChange={() => toggleChannel(c)} className="h-4 w-4 accent-accent" />
                {t(`support.studio.channel.${c}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-3">
          <legend className="mb-1 text-base font-medium text-fg">{t("support.studio.tools")}</legend>
          <div className="flex flex-wrap gap-3">
            {agent.tools.map((tool) => (
              <label key={tool.id} className="inline-flex items-center gap-2 text-base text-fg">
                <input type="checkbox" checked={tool.enabled} onChange={() => toggleTool(tool.id)} className="h-4 w-4 accent-accent" />
                {tool.label}
              </label>
            ))}
          </div>
        </fieldset>

        <h3 className="mb-2 text-base font-semibold text-fg">{t("support.studio.intents")}</h3>
        <ul className="mb-2 space-y-1">
          {agent.intents.map((intent) => (
            <li key={intent.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base">
              <span className="font-medium text-fg">{intent.label}</span>
              <span className="truncate text-muted">{intent.phrases.join(", ")}</span>
              <IconButton label={t("common.delete")} variant="ghost" className="ml-auto" onClick={() => removeIntent(intent.id)}>
                <Trash size={18} aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <input
              value={intentLabel}
              onChange={(e) => setIntentLabel(e.target.value)}
              placeholder={t("support.studio.intentLabelPh")}
              aria-label={t("support.studio.intentLabelPh")}
              className="h-11 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <input
              value={intentPhrases}
              onChange={(e) => setIntentPhrases(e.target.value)}
              placeholder={t("support.studio.intentPhrasesPh")}
              aria-label={t("support.studio.intentPhrasesPh")}
              className="h-11 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={intentReply}
              onChange={(e) => setIntentReply(e.target.value)}
              placeholder={t("support.studio.intentReplyPh")}
              aria-label={t("support.studio.intentReplyPh")}
              className="h-11 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <Button onClick={submitIntent}>
              <Plus size={18} aria-hidden /> {t("support.studio.addIntent")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Test + publish */}
      <Card>
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-fg">{t("support.studio.sandbox")}</h2>
          <Badge tone="accent" className="ml-auto">{t("support.studio.resolution", { n: rate })}</Badge>
        </div>
        <p className="mb-3 text-base text-muted">{t("support.studio.runs", { n: agent.metrics.runs })}</p>

        {testLog.length === 0 ? (
          <EmptyState icon={<Robot size={28} aria-hidden />} title={t("support.studio.sandboxEmpty")} />
        ) : (
          <ul className="mb-3 space-y-2">
            {testLog.map((turn) => (
              <li key={turn.id} className={cn("flex gap-2", turn.who === "user" ? "flex-row-reverse" : "")}>
                <span className={cn("mt-0.5 shrink-0", turn.who === "agent" ? "text-accent" : "text-muted")}>
                  {turn.who === "agent" ? <Robot size={18} aria-hidden /> : <User size={18} aria-hidden />}
                </span>
                <span className={cn("max-w-[80%] rounded-lg px-3 py-1.5 text-base", turn.who === "agent" ? "bg-surface text-fg" : "bg-accent text-accent-fg")}>
                  {turn.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mb-3 flex items-end gap-2">
          <label htmlFor="ag-test" className="sr-only">
            {t("support.studio.sandboxPh")}
          </label>
          <input
            id="ag-test"
            value={utterance}
            onChange={(e) => setUtterance(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            placeholder={t("support.studio.sandboxPh")}
            className="h-11 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <IconButton label={t("support.studio.run")} variant="primary" onClick={send} disabled={!utterance.trim()}>
            <PaperPlaneRight size={18} aria-hidden />
          </IconButton>
        </div>

        {ready.ok ? (
          <Button onClick={publish} disabled={agent.status === "published"}>
            <Rocket size={18} aria-hidden />
            {agent.status === "published" ? t("support.studio.published") : t("support.studio.publish")}
          </Button>
        ) : (
          <div className="rounded-md border border-warning/40 bg-surface p-2 text-base text-warning">
            <CheckCircle size={16} aria-hidden className="mr-1 inline" />
            {t("support.studio.missing")}: {ready.missing.map((m) => t(`support.studio.req.${m}`)).join(", ")}
          </div>
        )}
      </Card>
    </div>
  );
}
