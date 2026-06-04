import { PushPin, X } from "@/lib/icons";
import { useTranslation } from "react-i18next";
import { useMessagingStore } from "../store";

/** Pinned messages bar (Slack/Telegram). */
export function PinnedBar() {
  const { t } = useTranslation();
  const { messages, activeTopicId, togglePin } = useMessagingStore();
  const pinned = messages.filter(
    (m) => m.topicId === activeTopicId && m.pinned && !m.deleted,
  );
  if (pinned.length === 0) return null;
  const first = pinned[0];

  return (
    <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2">
      <PushPin size={16} weight="fill" className="shrink-0 text-accent" aria-hidden />
      <div className="min-w-0 flex-1 text-base">
        <span className="font-semibold text-fg">
          {t("messaging.pinnedMessages")} ({pinned.length})
        </span>
        <span className="ml-2 truncate text-muted">{first.body}</span>
      </div>
      <button
        onClick={() => togglePin(first.id)}
        aria-label={t("messaging.unpin")}
        className="rounded-md p-1 text-muted hover:bg-raised"
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}
