import * as React from "react";
import { useTranslation } from "react-i18next";
import { Backspace, PhoneCall } from "@/lib/icons";
import { useCallStore } from "../callStore";
import { formatNumber, normalizeNumber } from "../routing";
import { IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

const KEYS: { d: string; sub?: string }[] = [
  { d: "1" }, { d: "2", sub: "ABC" }, { d: "3", sub: "DEF" },
  { d: "4", sub: "GHI" }, { d: "5", sub: "JKL" }, { d: "6", sub: "MNO" },
  { d: "7", sub: "PQRS" }, { d: "8", sub: "TUV" }, { d: "9", sub: "WXYZ" },
  { d: "*" }, { d: "0", sub: "+" }, { d: "#" },
];

export function Dialer() {
  const { t } = useTranslation();
  const place = useCallStore((s) => s.place);
  const active = useCallStore((s) => s.activeCall);
  const [value, setValue] = React.useState("");

  const append = (d: string) => setValue((v) => v + d);
  const back = () => setValue((v) => v.slice(0, -1));
  const dial = () => {
    if (!value.trim()) return;
    place(value);
    setValue("");
  };

  // Show a friendly format once it looks like a full +1 number, else raw input.
  const display = value ? formatNumber(normalizeNumber(value)) : "";

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-stretch gap-3">
      <input
        value={display}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") dial();
        }}
        placeholder={t("phone.numberPlaceholder")}
        aria-label={t("phone.numberPlaceholder")}
        inputMode="tel"
        className="h-12 rounded-md border border-border bg-bg px-3 text-center text-2xl text-fg outline-none placeholder:text-muted placeholder:text-base"
      />

      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((k) => (
          <button
            key={k.d}
            type="button"
            aria-label={k.d}
            onClick={() => append(k.d)}
            className="flex h-14 flex-col items-center justify-center rounded-md border border-border bg-surface text-fg transition-colors hover:bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            <span className="text-2xl leading-none">{k.d}</span>
            {k.sub ? <span className="text-base leading-none text-muted" aria-hidden>{k.sub}</span> : null}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label={t("phone.call")}
          disabled={!value.trim() || !!active}
          onClick={dial}
          className={cn(
            "inline-flex h-14 w-14 items-center justify-center rounded-full bg-positive text-white transition-opacity hover:opacity-90 disabled:opacity-40",
          )}
        >
          <PhoneCall size={26} weight="fill" aria-hidden />
        </button>
        <IconButton label={t("phone.backspace")} onClick={back} disabled={!value}>
          <Backspace size={22} aria-hidden />
        </IconButton>
      </div>
    </div>
  );
}
