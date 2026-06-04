import * as React from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlass } from "@/lib/icons";
import { Modal } from "@/components/ui/Modal";
import { useMessagingStore } from "../store";
import { memberName } from "../members";

/** Cross-conversation message search (Slack/Teams enterprise search). */
export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const { messages, channels, topics, setChannel, setTopic } = useMessagingStore();
  const [q, setQ] = React.useState("");

  const query = q.trim().toLowerCase();
  const results =
    query.length >= 2
      ? messages
          .filter((m) => !m.deleted && !m.hiddenForMe && m.body.toLowerCase().includes(query))
          .slice(0, 40)
      : [];

  const jump = (channelId: string, topicId: string) => {
    setChannel(channelId);
    setTopic(topicId);
    setQ("");
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("messaging.searchAll")} hideTitle className="top-[10vh] p-0">
      <div className="flex items-center gap-2 border-b border-border px-4">
        <MagnifyingGlass size={20} className="text-muted" aria-hidden />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("messaging.searchAllPh")}
          aria-label={t("messaging.searchAll")}
          className="h-14 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-muted"
        />
      </div>
      <ul className="max-h-[55vh] overflow-y-auto p-2">
        {query.length < 2 ? (
          <li className="px-3 py-6 text-center text-base text-muted">{t("messaging.searchHint")}</li>
        ) : results.length === 0 ? (
          <li className="px-3 py-6 text-center text-base text-muted">{t("messaging.noResults")}</li>
        ) : (
          results.map((m) => {
            const ch = channels.find((c) => c.id === m.channelId);
            const tp = topics.find((x) => x.id === m.topicId);
            return (
              <li key={m.id}>
                <button
                  onClick={() => jump(m.channelId, m.topicId)}
                  className="flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-left hover:bg-surface"
                >
                  <span className="text-base font-medium text-fg">
                    {memberName(m.authorId)}{" "}
                    <span className="text-muted">
                      · {ch?.kind === "dm" ? ch.name : `#${ch?.name ?? ""}`}
                      {tp && tp.title !== "main" ? ` / ${tp.title}` : ""}
                    </span>
                  </span>
                  <span className="truncate text-base text-fg">
                    {m.body || t("messaging.voiceMessage")}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </Modal>
  );
}
