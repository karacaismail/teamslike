import { useTranslation } from "react-i18next";
import { Lightbulb, Warning, ThumbsUp, Headset, Lock } from "@/lib/icons";
import { useIntelStore } from "../store";
import { useAuthStore } from "@/store/authStore";
import type { IconType } from "@/types/domain";
import type { CoachingCue } from "../types";
import { fmtClock } from "./SentimentChip";

const KIND: Record<CoachingCue["kind"], { Icon: IconType; tone: string }> = {
  tip: { Icon: Lightbulb, tone: "text-accent" },
  warning: { Icon: Warning, tone: "text-danger" },
  praise: { Icon: ThumbsUp, tone: "text-positive" },
};

/** Live coaching "whisper" — RBAC: managers (admin.access) only. */
export function CoachingPanel() {
  const { t } = useTranslation();
  const coaching = useIntelStore((s) => s.coaching);
  const can = useAuthStore((s) => s.can);

  if (!can("admin.access")) {
    return coaching.length > 0 ? (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-base text-muted">
        <Lock size={16} aria-hidden /> {t("intel.coachingLocked")}
      </div>
    ) : null;
  }

  if (coaching.length === 0) return null;

  return (
    <div className="rounded-lg border border-accent bg-surface p-3">
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-accent">
        <Headset size={16} aria-hidden /> {t("intel.coaching")}
      </h3>
      <ul className="space-y-1.5" aria-live="polite">
        {coaching.map((c) => {
          const { Icon, tone } = KIND[c.kind];
          return (
            <li key={c.id} className="flex items-start gap-2 text-base">
              <Icon size={16} className={`mt-0.5 ${tone}`} aria-hidden />
              <span className="flex-1 text-fg">{c.text}</span>
              <span className="text-muted">{fmtClock(c.tSec)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
