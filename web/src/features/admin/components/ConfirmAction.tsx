import * as React from "react";
import { useTranslation } from "react-i18next";
import { Warning } from "@/lib/icons";
import { Button } from "@/components/ui/primitives";

/**
 * Dangerous-action confirmation pattern: reveal → type-to-verify → confirm.
 * Used for policy / federation / billing changes (governance).
 */
export function ConfirmAction({
  label,
  verifyWord,
  onConfirm,
  variant = "danger",
}: {
  label: string;
  verifyWord: string;
  onConfirm: () => void;
  variant?: "danger" | "primary" | "secondary";
}) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  if (!open) {
    return (
      <Button variant={variant} onClick={() => setOpen(true)}>
        {label}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-md border border-danger bg-surface p-2">
      <Warning size={18} className="text-danger" aria-hidden />
      <label className="flex flex-col gap-1 text-base text-fg">
        {t("admin.typeToConfirm", { word: verifyWord })}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={t("admin.typeToConfirm", { word: verifyWord })}
          className="h-10 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none"
        />
      </label>
      <Button
        variant={variant}
        disabled={value !== verifyWord}
        onClick={() => {
          onConfirm();
          setOpen(false);
          setValue("");
        }}
      >
        {t("admin.confirm")}
      </Button>
      <Button variant="ghost" onClick={() => { setOpen(false); setValue(""); }}>
        {t("admin.cancel")}
      </Button>
    </div>
  );
}
