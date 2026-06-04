import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { Button } from "./primitives";

/**
 * Confirmation modal for irreversible/heavy actions (delete room, delete for
 * everyone, cancel booking). Built on the accessible Modal (focus trap, Esc,
 * focus restore). Reversible/frequent actions should prefer an undo-toast.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  cancelLabel,
  variant = "danger",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-4 p-5">
        {body ? <p className="text-base text-muted">{body}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelLabel ?? t("common.cancel")}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
