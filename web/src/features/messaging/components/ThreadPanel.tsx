import * as React from "react";
import { useTranslation } from "react-i18next";
import { X, Sparkle, PaperPlaneRight } from "@/lib/icons";
import { useMessagingStore } from "../store";
import { MessageBubble } from "./MessageBubble";
import { useAuthStore } from "@/store/authStore";
import { useAskCopilot } from "@/lib/useCopilot";
import { IconButton, Button } from "@/components/ui/primitives";

export function ThreadPanel() {
  const { t } = useTranslation();
  const { threadRootId, messages, closeThread, reply } = useMessagingStore();
  const me = useAuthStore((s) => s.principal?.id ?? "usr_1");
  const ask = useAskCopilot();
  const [text, setText] = React.useState("");

  const root = messages.find((m) => m.id === threadRootId);
  if (!root) return null;

  const replies = messages
    .filter((m) => m.parentId === root.id)
    .slice()
    .sort((a, b) => b.tMinutes - a.tMinutes);

  const submit = () => {
    if (!text.trim()) return;
    reply(root.id, text, me);
    setText("");
  };

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={closeThread} aria-hidden />
      <aside
        aria-label={t("messaging.thread")}
        className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl lg:static lg:z-auto lg:w-96 lg:max-w-none lg:shadow-none"
      >
      <header className="flex items-center justify-between gap-2 border-b border-border p-3">
        <span className="text-base font-semibold text-fg">{t("messaging.thread")}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={() => ask(t("messaging.ai.summarizeThread"), t("messaging.thread"))}
          >
            <Sparkle size={18} aria-hidden />
            {t("messaging.summarizeThread")}
          </Button>
          <IconButton label={t("messaging.closeThread")} onClick={closeThread}>
            <X size={20} aria-hidden />
          </IconButton>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto py-2">
        <MessageBubble message={root} grouped={false} repliesCount={0} inThread />
        <div className="my-2 border-t border-border px-4 pt-2 text-base text-muted">
          {t("messaging.replies", { n: replies.length })}
        </div>
        {replies.map((r) => (
          <MessageBubble key={r.id} message={r} grouped={false} repliesCount={0} inThread />
        ))}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <label htmlFor="thread-reply" className="sr-only">
            {t("messaging.threadReplyPlaceholder")}
          </label>
          <textarea
            id="thread-reply"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={t("messaging.threadReplyPlaceholder")}
            className="min-h-[2.75rem] flex-1 resize-none rounded-md border border-border bg-raised p-2 text-base text-fg outline-none placeholder:text-muted"
          />
          <IconButton
            label={t("messaging.send")}
            variant="primary"
            onClick={submit}
            disabled={!text.trim()}
          >
            <PaperPlaneRight size={18} aria-hidden />
          </IconButton>
        </div>
      </div>
      </aside>
    </>
  );
}
