import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/primitives";
import { useMeetingStore } from "../store";
import { memberName } from "@/lib/identity";

export function BreakoutManager({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const { breakouts, createBreakouts, closeBreakouts } = useMeetingStore();

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("meetings.breakouts")}>
      <div className="p-5">
        <p className="text-base text-muted">{t("meetings.breakoutsHint")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[2, 3, 4].map((n) => (
            <Button key={n} variant="secondary" onClick={() => createBreakouts(n)}>
              {t("meetings.createRooms", { n })}
            </Button>
          ))}
          {breakouts.length > 0 ? (
            <Button variant="ghost" onClick={closeBreakouts}>
              {t("meetings.closeRooms")}
            </Button>
          ) : null}
        </div>

        {breakouts.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {breakouts.map((b) => (
              <li key={b.id} className="rounded-md border border-border bg-surface p-3">
                <div className="text-base font-semibold text-fg">{b.name}</div>
                <div className="text-base text-muted">
                  {b.participantIds.map((id) => memberName(id)).join(", ") || "—"}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Modal>
  );
}
