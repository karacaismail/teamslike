import { useTranslation } from "react-i18next";
import { PhoneCall, Pause, PhoneX } from "@/lib/icons";
import type { IconType } from "@/types/domain";
import type { CallState } from "../types";

/** Call-state indicator: color + icon + text label (AAA, never color-only). */
const MAP: Record<CallState, { Icon: IconType; tone: string }> = {
  ringing: { Icon: PhoneCall, tone: "text-warning" },
  active: { Icon: PhoneCall, tone: "text-positive" },
  hold: { Icon: Pause, tone: "text-accent" },
  ended: { Icon: PhoneX, tone: "text-muted" },
};

export function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CallStateChip({ state }: { state: CallState }) {
  const { t } = useTranslation();
  const { Icon, tone } = MAP[state];
  return (
    <span className={`inline-flex items-center gap-1 text-base font-medium ${tone}`}>
      <Icon size={16} weight="fill" aria-hidden />
      {t(`phone.state.${state}`)}
    </span>
  );
}
