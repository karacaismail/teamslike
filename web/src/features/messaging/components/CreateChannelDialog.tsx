import * as React from "react";
import { useTranslation } from "react-i18next";
import { Hash, Lock, UsersThree } from "@/lib/icons";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/primitives";
import { useMessagingStore } from "../store";
import { cn } from "@/lib/cn";
import type { ChannelKind } from "../types";

const KINDS: { kind: Extract<ChannelKind, "channel" | "private" | "shared">; labelKey: string; Icon: typeof Hash }[] = [
  { kind: "channel", labelKey: "messaging.publicChannel", Icon: Hash },
  { kind: "private", labelKey: "messaging.privateChannel", Icon: Lock },
  { kind: "shared", labelKey: "messaging.sharedChannel", Icon: UsersThree },
];

export function CreateChannelDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const createChannel = useMessagingStore((s) => s.createChannel);
  const [name, setName] = React.useState("");
  const [kind, setKind] = React.useState<"channel" | "private" | "shared">("channel");

  const submit = () => {
    if (!name.trim()) return;
    createChannel(name.trim().replace(/\s+/g, "-").toLowerCase(), kind);
    setName("");
    setKind("channel");
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("messaging.newChannel")}>
      <div className="space-y-3 p-5">
        <label className="block">
          <span className="mb-1 block text-base text-muted">{t("messaging.channelName")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("messaging.channelNamePh")}
            className="h-11 w-full rounded-md border border-border bg-bg px-3 text-base text-fg outline-none"
          />
        </label>
        <div className="flex gap-2">
          {KINDS.map(({ kind: k, labelKey, Icon }) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={cn(
                "flex h-11 flex-1 items-center justify-center gap-2 rounded-md border text-base",
                kind === k ? "border-accent bg-surface text-accent" : "border-border text-muted hover:bg-raised",
              )}
            >
              <Icon size={16} aria-hidden />
              {t(labelKey)}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("messaging.cancel")}
          </Button>
          <Button onClick={submit} disabled={!name.trim()}>
            {t("messaging.newChannel")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
