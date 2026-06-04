import * as React from "react";
import { useTranslation } from "react-i18next";
import { PaperPlaneRight, ChatCircle, Paperclip, UsersThree, Clock } from "@/lib/icons";
import { useSmsStore } from "../smsStore";
import { SMS_CANNED, SMS_TEMPLATES } from "../data";
import { formatNumber, renderTemplate } from "../routing";
import { Badge, Card, EmptyState, IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export function MessagesPane() {
  const { t } = useTranslation();
  const { threads, activeThreadId, setActiveThread, send, scheduleSms, scheduled } = useSmsStore();
  const [draft, setDraft] = React.useState("");
  const active = threads.find((x) => x.id === activeThreadId) ?? threads[0];
  const scheduledHere = active ? scheduled.filter((x) => x.threadId === active.id) : [];

  const applyTemplate = (id: string) => {
    const tpl = SMS_TEMPLATES.find((x) => x.id === id);
    if (tpl && active) setDraft(renderTemplate(tpl.body, { name: active.contact, date: "Thu 3pm", quote: "Q-102" }));
  };

  const submit = () => {
    if (!draft.trim() || !active) return;
    send(active.id, draft.trim());
    setDraft("");
  };

  return (
    <Card className="p-0">
      <div className="grid min-h-[24rem] grid-cols-[14rem_1fr] divide-x divide-border">
        {/* Threads */}
        <ul className="overflow-y-auto p-2" aria-label={t("phone.messages.title")}>
          {threads.map((th) => (
            <li key={th.id}>
              <button
                onClick={() => setActiveThread(th.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left",
                  th.id === active?.id ? "bg-surface" : "hover:bg-surface",
                )}
              >
                <ChatCircle size={18} className="text-muted" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-base text-fg">{th.contact}</span>
                {th.unread > 0 ? <Badge tone="accent">{th.unread}</Badge> : null}
              </button>
            </li>
          ))}
        </ul>

        {/* Conversation */}
        <div className="flex min-w-0 flex-col">
          {active ? (
            <>
              <div className="border-b border-border px-3 py-2">
                <div className="flex items-center gap-2 text-base font-semibold text-fg">
                  {active.participants?.length ? <UsersThree size={16} className="text-muted" aria-hidden /> : null}
                  {active.contact}
                </div>
                <div className="text-base text-muted">
                  {active.participants?.length
                    ? t("phone.messages.groupMembers", { n: active.participants.length })
                    : formatNumber(active.e164)}
                </div>
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                {active.messages.map((m) => (
                  <div key={m.id} className={cn("flex", m.outbound ? "justify-end" : "justify-start")}>
                    <span
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-1.5 text-base",
                        m.outbound ? "bg-accent text-accent-fg" : "bg-surface text-fg",
                      )}
                    >
                      {m.body}
                      {m.media?.map((md) => (
                        <span key={md.name} className="mt-1 flex items-center gap-1 text-base opacity-90">
                          <Paperclip size={14} aria-hidden /> {md.name}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-2">
                {scheduledHere.length > 0 ? (
                  <div className="mb-2 flex flex-wrap items-center gap-1.5 text-base text-muted">
                    <Clock size={14} aria-hidden /> {t("phone.messages.scheduledCount", { n: scheduledHere.length })}
                  </div>
                ) : null}
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  {SMS_CANNED.map((c) => (
                    <button
                      key={c}
                      onClick={() => setDraft(c)}
                      className="rounded-full border border-border px-2 py-0.5 text-base text-muted hover:bg-surface"
                    >
                      {c}
                    </button>
                  ))}
                  <select
                    value=""
                    onChange={(e) => applyTemplate(e.target.value)}
                    aria-label={t("phone.messages.template")}
                    className="h-8 rounded-md border border-border bg-bg px-2 text-base text-muted"
                  >
                    <option value="">{t("phone.messages.template")}</option>
                    {SMS_TEMPLATES.map((tpl) => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submit();
                    }}
                    placeholder={t("phone.messages.composerPh")}
                    aria-label={t("phone.messages.composerPh")}
                    className="h-11 flex-1 rounded-md border border-border bg-bg px-3 text-base text-fg outline-none placeholder:text-muted"
                  />
                  <IconButton
                    label={t("phone.messages.schedule")}
                    disabled={!draft.trim()}
                    onClick={() => {
                      scheduleSms(active.id, draft.trim(), Date.now() + 3_600_000);
                      setDraft("");
                    }}
                  >
                    <Clock size={18} aria-hidden />
                  </IconButton>
                  <IconButton label={t("phone.messages.send")} variant="primary" disabled={!draft.trim()} onClick={submit}>
                    <PaperPlaneRight size={18} aria-hidden />
                  </IconButton>
                </div>
              </div>
            </>
          ) : (
            <EmptyState icon={<ChatCircle size={28} aria-hidden />} title={t("phone.messages.empty")} />
          )}
        </div>
      </div>
    </Card>
  );
}
