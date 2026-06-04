import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle } from "@/lib/icons";
import { useIntelStore } from "../store";
import { RUBRICS } from "../data";
import { Card, Badge } from "@/components/ui/primitives";

/** Custom AI scorecard rubric — auto pass/fail per criterion (Dialpad). */
export function RubricCard() {
  const { t } = useTranslation();
  const id = useIntelStore((s) => s.activeSourceId);
  const rubric = RUBRICS[id] ?? [];
  if (rubric.length === 0) return null;
  const passed = rubric.filter((r) => r.pass).length;

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold text-fg">{t("intel.rubric")}</h3>
        <Badge tone={passed === rubric.length ? "positive" : "warning"}>
          {passed}/{rubric.length}
        </Badge>
      </div>
      <ul className="space-y-1.5">
        {rubric.map((r) => (
          <li key={r.id} className="flex items-start gap-2 text-base">
            {r.pass ? (
              <CheckCircle size={18} weight="fill" className="mt-0.5 text-positive" aria-label={t("intel.pass")} />
            ) : (
              <XCircle size={18} weight="fill" className="mt-0.5 text-danger" aria-label={t("intel.fail")} />
            )}
            <span className={r.pass ? "text-fg" : "text-muted"}>{r.label}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
