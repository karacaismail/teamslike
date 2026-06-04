import { useTranslation } from "react-i18next";
import { CalendarBlank } from "@/lib/icons";
import { MEMBER_NAMES } from "../data";
import { Card } from "@/components/ui/primitives";
import type { DataTable, TableRow } from "../types";

/**
 * Calendar / agenda view derived from a table's first date column (Faz 9).
 * Demonstrates a view computed live from the relational table data.
 */
export function CalendarView({ table }: { table: DataTable }) {
  const { t } = useTranslation();
  const dateCol = table.columns.find((c) => c.type === "date");
  const labelCol = table.columns.find((c) => c.type === "text") ?? table.columns[0];
  const personCol = table.columns.find((c) => c.type === "person");

  if (!dateCol) {
    return (
      <Card>
        <p className="text-base text-muted">{t("docs.table.noDate")}</p>
      </Card>
    );
  }

  const byDate = new Map<string, TableRow[]>();
  for (const r of table.rows) {
    const d = r.cells[dateCol.id] || t("docs.table.noDate");
    const bucket = byDate.get(d) ?? [];
    bucket.push(r);
    byDate.set(d, bucket);
  }
  const dates = [...byDate.keys()].sort();

  return (
    <Card>
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
        <CalendarBlank size={18} aria-hidden /> {t("docs.table.calendar")} · {dateCol.name}
      </h3>
      <ul className="space-y-3">
        {dates.map((d) => (
          <li key={d}>
            <div className="text-base font-semibold text-accent">{d}</div>
            <ul className="ml-3 mt-1 space-y-1">
              {byDate.get(d)!.map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-base text-fg">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span className="flex-1 truncate">{r.cells[labelCol.id] || "—"}</span>
                  {personCol ? (
                    <span className="text-muted">{MEMBER_NAMES[r.cells[personCol.id]] ?? r.cells[personCol.id] ?? ""}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Card>
  );
}
