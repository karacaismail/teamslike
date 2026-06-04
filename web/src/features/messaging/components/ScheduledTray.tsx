import { useTranslation } from "react-i18next";
import { Clock, PaperPlaneRight, Trash } from "@/lib/icons";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/primitives";
import { useMessagingStore } from "../store";

/** Scheduled messages tray (Telegram). */
export function ScheduledTray({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const { messages, activeTopicId, sendScheduledNow, deleteScheduled } = useMessagingStore();
  const scheduled = messages.filter((m) => m.topicId === activeTopicId && m.scheduled);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("messaging.scheduledTitle")}>
      <div className="p-5">
        {scheduled.length === 0 ? (
          <p className="text-base text-muted">{t("messaging.scheduledEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {scheduled.map((m) => (
              <li key={m.id} className="flex items-center gap-2 rounded-md border border-border bg-surface p-3">
                <Clock size={18} className="text-muted" aria-hidden />
                <span className="flex-1 text-base text-fg">{m.body}</span>
                <Button
                  onClick={() => {
                    sendScheduledNow(m.id);
                    onOpenChange(false);
                  }}
                >
                  <PaperPlaneRight size={16} aria-hidden />
                  {t("messaging.sendNow")}
                </Button>
                <Button variant="ghost" onClick={() => deleteScheduled(m.id)}>
                  <Trash size={16} aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
