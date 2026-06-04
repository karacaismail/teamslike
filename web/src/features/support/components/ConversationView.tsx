import * as React from "react";
import { useTranslation } from "react-i18next";
import { PaperPlaneRight, Note, Sparkle, Lightning, Check, X } from "@/lib/icons";
import { useConversationStore } from "../conversationStore";
import { useAuthStore } from "@/store/authStore";
import { aiSuggest } from "../api";
import { renderCanned } from "../support";
import { CANNED, CONTACTS, MACROS } from "../data";
import { contactName, agentName } from "./shared";
import { Badge, Button, IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { ConversationStatus } from "../types";

const STATUSES: ConversationStatus[] = ["open", "pending", "snoozed", "resolved"];

export function ConversationView() {
  const { t } = useTranslation();
  const convId = useConversationStore((s) => s.activeConversationId);
  const conv = useConversationStore((s) => s.conversations.find((c) => c.id === s.activeConversationId) ?? null);
  const { sendReply, addNote, setStatus, applyMacro } = useConversationStore.getState();
  const me = useAuthStore((a) => a.principal?.id ?? "usr_1");

  const [draft, setDraft] = React.useState("");
  const [note, setNote] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<string | null>(null);
  const [loadingAi, setLoadingAi] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [conv?.messages.length]);

  if (!conv) return <div className="flex flex-1 items-center justify-center text-base text-muted">{t("support.selectConv")}</div>;

  const contact = CONTACTS.find((c) => c.id === conv.contactId);
  const cannedMatches = draft.startsWith("/")
    ? CANNED.filter((c) => c.shortcode.startsWith(draft.split(" ")[0]))
    : [];

  const submit = () => {
    if (!draft.trim() || !convId) return;
    if (note) addNote(convId, draft.trim(), me);
    else sendReply(convId, draft.trim(), me);
    setDraft("");
    setSuggestion(null);
  };

  const insertCanned = (body: string) =>
    setDraft(renderCanned(body, { name: contact?.name ?? "", plan: contact?.attributes.plan ?? "" }));

  const runAi = async () => {
    if (!convId) return;
    setLoadingAi(true);
    const text = await aiSuggest(convId);
    setSuggestion(text);
    setLoadingAi(false);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <span className="text-base font-semibold text-fg">{contactName(conv.contactId)}</span>
        {conv.assigneeId ? <Badge tone="neutral">{t("support.assignedTo", { name: agentName(conv.assigneeId) })}</Badge> : null}
        <select
          value={conv.status}
          onChange={(e) => setStatus(conv.id, e.target.value as ConversationStatus)}
          aria-label={t("support.status.label")}
          className="ml-auto h-10 rounded-md border border-border bg-bg px-2 text-base text-fg"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{t(`support.status.${s}`)}</option>)}
        </select>
      </div>

      {/* Macros */}
      <div className="flex flex-wrap gap-1.5 border-b border-border px-3 py-1.5">
        {MACROS.map((m) => (
          <button key={m.id} onClick={() => applyMacro(conv.id, m)} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-base text-muted hover:bg-surface">
            <Lightning size={14} aria-hidden /> {m.name}
          </button>
        ))}
      </div>

      {/* Thread */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
        {conv.messages.map((m) => {
          if (m.authorType === "note") {
            return (
              <div key={m.id} className="rounded-md border-l-2 border-warning bg-surface px-3 py-1.5 text-base text-fg">
                <span className="text-warning">{t("support.note")}: </span>{m.body}
              </div>
            );
          }
          const out = m.direction === "out";
          return (
            <div key={m.id} className={cn("flex", out ? "justify-end" : "justify-start")}>
              <span className={cn("max-w-[80%] rounded-lg px-3 py-1.5 text-base", out ? "bg-accent text-accent-fg" : "bg-surface text-fg")}>
                {m.body}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* AI suggestion (human-approved) */}
      {suggestion ? (
        <div className="mx-3 mb-2 rounded-md border border-accent bg-surface p-2">
          <div className="mb-1 flex items-center gap-1 text-base text-accent"><Sparkle size={14} aria-hidden /> {t("support.aiDraft")}</div>
          <p className="text-base text-fg">{suggestion}</p>
          <div className="mt-1 flex gap-2">
            <Button onClick={() => { setDraft(suggestion); setSuggestion(null); }}>
              <Check size={14} aria-hidden /> {t("support.insertDraft")}
            </Button>
            <Button variant="ghost" onClick={() => setSuggestion(null)}><X size={14} aria-hidden /> {t("support.dismiss")}</Button>
          </div>
        </div>
      ) : null}

      {/* Canned suggestions */}
      {cannedMatches.length > 0 ? (
        <div className="mx-3 mb-1 flex flex-wrap gap-1">
          {cannedMatches.map((c) => (
            <button key={c.id} onClick={() => insertCanned(c.body)} className="rounded-full border border-border px-2 py-0.5 text-base text-muted hover:bg-surface">
              {c.shortcode}
            </button>
          ))}
        </div>
      ) : null}

      {/* Reply box */}
      <div className="border-t border-border p-2">
        <div className="flex items-end gap-2">
          <IconButton label={note ? t("support.replyMode") : t("support.noteMode")} variant={note ? "primary" : "ghost"} onClick={() => setNote((v) => !v)}>
            <Note size={18} aria-hidden />
          </IconButton>
          <IconButton label={t("support.aiSuggest")} variant="ghost" disabled={loadingAi} onClick={runAi}>
            <Sparkle size={18} aria-hidden />
          </IconButton>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={note ? t("support.notePh") : t("support.replyPh")}
            aria-label={note ? t("support.notePh") : t("support.replyPh")}
            className={cn("h-11 flex-1 rounded-md border bg-bg px-3 text-base text-fg outline-none placeholder:text-muted", note ? "border-warning" : "border-border")}
          />
          <IconButton label={t("support.send")} variant="primary" disabled={!draft.trim()} onClick={submit}>
            <PaperPlaneRight size={18} aria-hidden />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
