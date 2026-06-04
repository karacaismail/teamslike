import { useTranslation } from "react-i18next";
import { BookmarkSimple } from "@/lib/icons";
import { Modal } from "@/components/ui/Modal";
import { useMessagingStore } from "../store";
import { TOPICS } from "../data";
import { memberName } from "../members";

/** Saved / starred items across all chats (Slack/Telegram saved messages). */
export function SavedDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const { messages, channels, setChannel, setTopic } = useMessagingStore();
  const saved = messages.filter((m) => m.saved && !m.deleted);

  const goto = (channelId: string, topicId: string) => {
    setChannel(channelId);
    setTopic(topicId);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("messaging.savedTitle")}>
      <div className="p-5">
        {saved.length === 0 ? (
          <p className="text-base text-muted">{t("messaging.savedEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {saved.map((m) => {
              const ch = channels.find((c) => c.id === m.channelId);
              const tp = TOPICS.find((x) => x.id === m.topicId);
              return (
                <li key={m.id}>
                  <button
                    onClick={() => goto(m.channelId, m.topicId)}
                    className="flex w-full items-start gap-2 rounded-md border border-border bg-surface p-3 text-left hover:border-accent"
                  >
                    <BookmarkSimple size={18} weight="fill" className="mt-0.5 text-accent" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-medium text-fg">
                        {memberName(m.authorId)} ·{" "}
                        <span className="text-muted">
                          {ch?.kind === "dm" ? ch.name : `#${ch?.name ?? ""}`}
                          {tp && tp.title !== "main" ? ` / ${tp.title}` : ""}
                        </span>
                      </span>
                      <span className="block truncate text-base text-fg">
                        {m.body || t("messaging.voiceMessage")}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
