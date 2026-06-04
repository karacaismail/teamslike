import { Smiley, SmileyMeh, SmileySad } from "@/lib/icons";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import type { Sentiment } from "../types";

const MAP: Record<Sentiment, { Icon: typeof Smiley; tone: string }> = {
  positive: { Icon: Smiley, tone: "text-positive" },
  neutral: { Icon: SmileyMeh, tone: "text-muted" },
  negative: { Icon: SmileySad, tone: "text-danger" },
};

/** Sentiment is conveyed by colour + icon + label (never colour alone — AAA). */
export function SentimentChip({ sentiment, className }: { sentiment: Sentiment; className?: string }) {
  const { t } = useTranslation();
  const { Icon, tone } = MAP[sentiment];
  return (
    <span className={cn("inline-flex items-center gap-1 text-base", tone, className)}>
      <Icon size={16} weight="fill" aria-hidden />
      {t(`intel.sentiment.${sentiment}`)}
    </span>
  );
}

export function sentimentFromValue(v: number): Sentiment {
  if (v > 0.2) return "positive";
  if (v < -0.2) return "negative";
  return "neutral";
}

export function fmtClock(sec: number) {
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
}
