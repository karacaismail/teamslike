import { useTranslation } from "react-i18next";
import { Target } from "@/lib/icons";
import { useIntelStore } from "../store";
import { INTENTS } from "../data";
import { Card } from "@/components/ui/primitives";

/** Detected intents with confidence (Demio intent analytics / Dialpad). */
export function IntentList() {
  const { t } = useTranslation();
  const id = useIntelStore((s) => s.activeSourceId);
  const intents = INTENTS[id] ?? [];

  return (
    <Card>
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
        <Target size={16} aria-hidden /> {t("intel.intents")}
      </h3>
      {intents.length === 0 ? (
        <p className="text-base text-muted">{t("intel.none")}</p>
      ) : (
        <ul className="space-y-2">
          {intents.map((i) => (
            <li key={i.id}>
              <div className="flex items-center justify-between text-base">
                <span className="text-fg">{i.label}</span>
                <span className="text-muted">{Math.round(i.confidence * 100)}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(i.confidence * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
