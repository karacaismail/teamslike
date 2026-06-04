import { useTranslation } from "react-i18next";
import { ChartBar } from "@/lib/icons";
import { ganttBars } from "../tables";
import { Card } from "@/components/ui/primitives";
import type { DataTable } from "../types";

/** Gantt-style timeline derived from a table's first date column (Faz 9). */
export function GanttView({ table }: { table: DataTable }) {
  const { t } = useTranslation();
  const bars = ganttBars(table);
  const dateCol = table.columns.find((c) => c.type === "date");

  if (bars.length === 0) {
    return (
      <Card>
        <p className="text-base text-muted">{t("docs.table.noDate")}</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
        <ChartBar size={18} aria-hidden /> {t("docs.table.gantt")}{dateCol ? ` · ${dateCol.name}` : ""}
      </h3>
      <ul className="space-y-2">
        {bars.map((b) => (
          <li key={b.id} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-base text-fg">{b.label}</span>
            <div className="relative h-3 flex-1 rounded-full bg-surface">
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
                style={{ left: `${b.startFrac * 100}%` }}
                aria-hidden
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
