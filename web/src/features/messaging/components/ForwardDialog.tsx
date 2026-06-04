import { Hash, Lock, Megaphone, ChatCircle } from "@/lib/icons";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { useMessagingStore } from "../store";
import { useToastStore } from "@/store/toastStore";
import { CHANNELS } from "../data";
import type { ChannelKind } from "../types";

function KindGlyph({ kind }: { kind: ChannelKind }) {
  const Icon =
    kind === "private"
      ? Lock
      : kind === "broadcast"
        ? Megaphone
        : kind === "dm"
          ? ChatCircle
          : Hash;
  return <Icon size={18} aria-hidden />;
}

export function ForwardDialog({
  open,
  onOpenChange,
  messageId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  messageId: string;
}) {
  const { t } = useTranslation();
  const forward = useMessagingStore((s) => s.forward);
  const activeChannelId = useMessagingStore((s) => s.activeChannelId);
  const push = useToastStore((s) => s.push);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("messaging.forwardTo")}>
      <ul className="max-h-[50vh] overflow-y-auto p-2">
        {CHANNELS.filter((c) => c.id !== activeChannelId).map((c) => (
          <li key={c.id}>
            <button
              onClick={() => {
                forward(messageId, c.id);
                push({ title: t("messaging.forwardDone"), tone: "positive" });
                onOpenChange(false);
              }}
              className="flex h-11 w-full items-center gap-2 rounded-md px-2 text-base text-fg hover:bg-surface"
            >
              <KindGlyph kind={c.kind} />
              <span className="truncate">{c.kind === "dm" ? c.name : `#${c.name}`}</span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
