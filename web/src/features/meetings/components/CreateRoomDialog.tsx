import * as React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/primitives";
import { useMeetingStore } from "../store";
import { cn } from "@/lib/cn";

/** Moderator-created persistent video room (Jitsi-style). */
export function CreateRoomDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const createRoom = useMeetingStore((s) => s.createRoom);
  const [name, setName] = React.useState("");
  const [locked, setLocked] = React.useState(false);
  const [waitingRoom, setWaitingRoom] = React.useState(true);
  const [password, setPassword] = React.useState("");

  const submit = () => {
    if (!name.trim()) return;
    createRoom(name, { locked, waitingRoom, password: password || undefined });
    setName("");
    setPassword("");
    setLocked(false);
    setWaitingRoom(true);
    onOpenChange(false);
  };

  const Toggle = ({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) => (
    <button
      onClick={() => set(!on)}
      aria-pressed={on}
      className={cn(
        "h-9 rounded-md border px-3 text-base",
        on ? "border-accent bg-surface text-accent" : "border-border bg-raised text-muted",
      )}
    >
      {label}
    </button>
  );

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("meetings.createRoom")}>
      <div className="space-y-3 p-5">
        <label className="block">
          <span className="mb-1 block text-base text-muted">{t("meetings.roomName")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("meetings.roomNamePh")}
            className="h-11 w-full rounded-md border border-border bg-bg px-3 text-base text-fg outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Toggle on={locked} set={setLocked} label={t("meetings.roomLocked")} />
          <Toggle on={waitingRoom} set={setWaitingRoom} label={t("meetings.roomWaiting")} />
        </div>
        <label className="block">
          <span className="mb-1 block text-base text-muted">{t("meetings.roomPassword")}</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("meetings.roomPasswordPh")}
            className="h-11 w-full rounded-md border border-border bg-bg px-3 text-base text-fg outline-none"
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("meetings.cancel")}
          </Button>
          <Button onClick={submit} disabled={!name.trim()}>
            {t("meetings.createRoom")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
