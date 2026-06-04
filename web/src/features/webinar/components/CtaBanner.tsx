import { useTranslation } from "react-i18next";
import { ArrowSquareOut } from "@/lib/icons";
import { CTAS } from "../data";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/ui/primitives";

/** Attendee call-to-action; clicks record intent (fed to Conversation Intelligence, Faz 4). */
export function CtaBanner() {
  const { t } = useTranslation();
  const push = useToastStore((s) => s.push);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent bg-surface px-3 py-2">
      <span className="text-base font-medium text-fg">{t("webinar.ctaTitle")}</span>
      <div className="ml-auto flex flex-wrap gap-2">
        {CTAS.map((c) => (
          <Button
            key={c.id}
            variant="secondary"
            onClick={() => push({ title: t("webinar.ctaRecorded", { label: c.label }), tone: "positive" })}
          >
            <ArrowSquareOut size={16} aria-hidden /> {c.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
