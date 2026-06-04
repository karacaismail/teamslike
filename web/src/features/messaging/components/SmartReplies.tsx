import { useTranslation } from "react-i18next";
import { Sparkle } from "@/lib/icons";

/** AI smart-reply chips (Chatwoot Captain). */
export function SmartReplies({ onPick }: { onPick: (text: string) => void }) {
  const { t } = useTranslation();
  const items = t("messaging.smart", { returnObjects: true }) as unknown as string[];
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-1 pb-2">
      <span className="inline-flex items-center gap-1 text-base text-muted">
        <Sparkle size={14} className="text-accent" aria-hidden />
        {t("messaging.smartReplies")}
      </span>
      {items.map((s, i) => (
        <button
          key={i}
          onClick={() => onPick(s)}
          className="rounded-full border border-border bg-surface px-3 py-1 text-base text-fg hover:bg-raised"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
