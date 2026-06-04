import * as React from "react";
import { useTranslation } from "react-i18next";
import { Check } from "@/lib/icons";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/primitives";
import { Avatar } from "@/components/ui/Avatar";
import { PresenceDot } from "@/components/ui/PresenceDot";
import { useMessagingStore } from "../store";
import { TEAM } from "@/data/team";
import { cn } from "@/lib/cn";

export function NewDmDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const createDm = useMessagingStore((s) => s.createDm);
  const [sel, setSel] = React.useState<string[]>([]);
  const candidates = TEAM.filter((m) => m.id !== "usr_1");

  const toggle = (id: string) =>
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = () => {
    if (sel.length === 0) return;
    createDm(sel);
    setSel([]);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("messaging.newDm")}>
      <div className="p-5">
        <p className="mb-2 text-base text-muted">{t("messaging.newDmHint")}</p>
        <ul className="max-h-[40vh] space-y-1 overflow-y-auto">
          {candidates.map((m) => {
            const on = sel.includes(m.id);
            return (
              <li key={m.id}>
                <button
                  onClick={() => toggle(m.id)}
                  aria-pressed={on}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left text-base",
                    on ? "border-accent bg-surface" : "border-transparent hover:bg-surface",
                  )}
                >
                  <span className="relative inline-block">
                    <Avatar name={m.name} size={30} />
                    <PresenceDot presence={m.presence} className="absolute -bottom-0.5 -right-0.5" />
                  </span>
                  <span className="flex-1 truncate text-fg">{m.name}</span>
                  {on ? <Check size={18} className="text-accent" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("messaging.cancel")}
          </Button>
          <Button onClick={submit} disabled={sel.length === 0}>
            {sel.length > 1 ? t("messaging.startGroupDm") : t("messaging.startDm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
