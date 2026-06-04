import { useTranslation } from "react-i18next";
import { SealCheck, ListChecks, Warning, Question, ArrowRight } from "@/lib/icons";
import { useIntelStore } from "../store";
import { Card } from "@/components/ui/primitives";
import type { IconType } from "@/types/domain";
import type { Highlight } from "../types";

const KIND: Record<Highlight["kind"], { Icon: IconType; tone: string }> = {
  decision: { Icon: SealCheck, tone: "text-accent" },
  action: { Icon: ListChecks, tone: "text-positive" },
  objection: { Icon: Warning, tone: "text-danger" },
  question: { Icon: Question, tone: "text-warning" },
};

/** Key moments → jump to the transcript segment. */
export function HighlightReel() {
  const { t } = useTranslation();
  const highlights = useIntelStore((s) => s.highlights);

  const jump = (segmentId: string) => {
    const el = document.getElementById(`seg-${segmentId}`);
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  return (
    <Card>
      <h3 className="mb-2 text-base font-semibold text-fg">{t("intel.highlights")}</h3>
      {highlights.length === 0 ? (
        <p className="text-base text-muted">{t("intel.none")}</p>
      ) : (
        <ul className="space-y-2">
          {highlights.map((h) => {
            const { Icon, tone } = KIND[h.kind];
            return (
              <li key={h.id}>
                <button
                  onClick={() => jump(h.segmentId)}
                  className="flex w-full items-start gap-2 rounded-md border border-border p-2 text-left hover:border-accent"
                >
                  <Icon size={18} className={`mt-0.5 ${tone}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-medium text-fg">{t(`intel.kind.${h.kind}`)}</span>
                    <span className="block text-base text-muted">{h.text}</span>
                  </span>
                  <ArrowRight size={16} className="mt-0.5 text-muted" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
