import { useTranslation } from "react-i18next";
import { ChartLineUp } from "@/lib/icons";
import { hillPoints } from "../tables";
import { Card } from "@/components/ui/primitives";
import type { DataTable } from "../types";

/** Basecamp-style Hill chart from a status (select) column (Faz 9): uphill =
 *  still figuring out, downhill = executing. */
export function HillView({ table }: { table: DataTable }) {
  const { t } = useTranslation();
  const pts = hillPoints(table);
  const statusCol = table.columns.find((c) => c.type === "select");

  if (pts.length === 0) {
    return (
      <Card>
        <p className="text-base text-muted">{t("docs.table.noStatus")}</p>
      </Card>
    );
  }

  const curve = Array.from({ length: 51 }, (_, i) => {
    const x = i / 50;
    const y = Math.sin(x * Math.PI);
    return `${i === 0 ? "M" : "L"} ${(x * 100).toFixed(1)} ${(40 - y * 36).toFixed(1)}`;
  }).join(" ");

  return (
    <Card>
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
        <ChartLineUp size={18} aria-hidden /> {t("docs.table.hill")}{statusCol ? ` · ${statusCol.name}` : ""}
      </h3>
      <svg viewBox="0 0 100 44" className="w-full text-border" role="img" aria-label={t("docs.table.hill")}>
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="0.6" />
        <line x1="50" y1="2" x2="50" y2="44" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 1.5" />
        {pts.map((p) => (
          <circle key={p.id} cx={p.x * 100} cy={40 - p.y * 36} r="1.8" className="fill-accent" />
        ))}
      </svg>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {pts.map((p) => (
          <li key={p.id} className="flex items-center gap-1 text-base text-fg">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden /> {p.label}
          </li>
        ))}
      </ul>
    </Card>
  );
}
