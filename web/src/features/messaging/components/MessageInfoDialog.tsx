import { useTranslation } from "react-i18next";
import { Checks } from "@/lib/icons";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { TEAM } from "@/data/team";
import { relTime } from "@/lib/time";
import type { Message } from "../types";

/** WhatsApp-style "Message info" — per-recipient delivered/read state (mock). */
export function MessageInfoDialog({
  open,
  onOpenChange,
  message,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  message: Message;
}) {
  const { t } = useTranslation();
  const recipients = TEAM.filter((m) => m.id !== message.authorId).slice(0, 4);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("messaging.messageInfo")}>
      <div className="p-5">
        <div className="mb-3 rounded-md border-l-2 border-accent bg-surface px-3 py-2 text-base text-fg">
          {message.body || t("messaging.voiceMessage")}
        </div>
        <ul className="space-y-2">
          {recipients.map((r, i) => {
            const read = i !== recipients.length - 1; // last one only "delivered"
            return (
              <li key={r.id} className="flex items-center gap-3">
                <Avatar name={r.name} size={32} />
                <span className="flex-1 truncate text-base text-fg">{r.name}</span>
                <span className="inline-flex items-center gap-1 text-base">
                  <Checks size={16} className={read ? "text-accent" : "text-muted"} aria-hidden />
                  <span className={read ? "text-accent" : "text-muted"}>
                    {read ? t("messaging.deliveryRead") : t("messaging.deliveryDelivered")}
                  </span>
                  <span className="text-muted">· {relTime(t, (i + 1) * 3)}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}
