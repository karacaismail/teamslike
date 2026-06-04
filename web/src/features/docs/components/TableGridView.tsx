import * as React from "react";
import { useTranslation } from "react-i18next";
import { Plus, GridFour, CalendarBlank, ChartBar, ChartLineUp, Trash, X } from "@/lib/icons";
import { useDocsStore } from "../docsStore";
import { MEMBER_NAMES } from "../data";
import { computeCell, columnTotal } from "../tables";
import { Button, Card, Skeleton } from "@/components/ui/primitives";
import { useFirstLoad } from "@/lib/useFirstLoad";
import { cn } from "@/lib/cn";
import { CalendarView } from "./CalendarView";
import { GanttView } from "./GanttView";
import { HillView } from "./HillView";
import type { ColumnType, TableColumn, TableRow } from "../types";

const NEW_COL_TYPES: ColumnType[] = ["text", "number", "date", "person"];

const MEMBERS = Object.entries(MEMBER_NAMES); // [id, name]

/** Loading placeholder shaped like the table: a view-tab strip over a header
 *  row and a few body rows of cells (not generic contact rows). */
function TableSkeleton({ label }: { label: string }) {
  return (
    <Card>
      <div role="status" aria-live="polite">
        <span className="sr-only">{label}</span>
        <div className="mb-3 flex gap-1" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-md" />
          ))}
        </div>
        <div className="space-y-2" aria-hidden>
          {Array.from({ length: 6 }).map((_, r) => (
            <div key={r} className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, c) => (
                <Skeleton key={c} className="h-9" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/**
 * Relational table with live, editable cells + a no-`eval` formula engine and a
 * derived calendar view (Faz 9 — Coda "doc-as-app"). Edits flow through the
 * docs store so totals and formula columns recompute instantly.
 */
export function TableGridView() {
  const { t } = useTranslation();
  const tables = useDocsStore((s) => s.tables);
  const activeTableId = useDocsStore((s) => s.activeTableId);
  const editCell = useDocsStore((s) => s.editCell);
  const addTableRow = useDocsStore((s) => s.addTableRow);
  const addTableColumn = useDocsStore((s) => s.addTableColumn);
  const deleteTableRow = useDocsStore((s) => s.deleteTableRow);
  const deleteTableColumn = useDocsStore((s) => s.deleteTableColumn);
  const [view, setView] = React.useState<"grid" | "calendar" | "gantt" | "hill">("grid");
  const [newColName, setNewColName] = React.useState("");
  const [newColType, setNewColType] = React.useState<ColumnType>("text");
  const firstLoad = useFirstLoad();

  const table = tables.find((tb) => tb.id === activeTableId) ?? tables[0];
  if (!table) return null;
  if (firstLoad) return <TableSkeleton label={t("common.loading")} />;

  const inputBase =
    "h-9 w-full min-w-[6rem] rounded-md border border-border bg-bg px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent";

  const cell = (row: TableRow, col: TableColumn) => {
    const v = row.cells[col.id] ?? "";
    const onChange = (val: string) => editCell(table.id, row.id, col.id, val);
    if (col.type === "formula") {
      return <span className="block px-2 text-base text-muted">{computeCell(table, row, col)}</span>;
    }
    if (col.type === "select") {
      return (
        <select aria-label={col.name} value={v} onChange={(e) => onChange(e.target.value)} className={inputBase}>
          <option value="">—</option>
          {(col.options ?? []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    }
    if (col.type === "person") {
      return (
        <select aria-label={col.name} value={v} onChange={(e) => onChange(e.target.value)} className={inputBase}>
          <option value="">—</option>
          {MEMBERS.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      );
    }
    return (
      <input
        aria-label={col.name}
        type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
        value={v}
        onChange={(e) => onChange(e.target.value)}
        className={inputBase}
      />
    );
  };

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-fg">{table.title}</h3>
        <div className="ml-auto inline-flex overflow-hidden rounded-md border border-border" role="group" aria-label={t("docs.table.view")}>
          <button
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
            className={cn("inline-flex h-9 items-center gap-1 px-3 text-base", view === "grid" ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:bg-surface")}
          >
            <GridFour size={16} aria-hidden /> {t("docs.table.grid")}
          </button>
          <button
            onClick={() => setView("calendar")}
            aria-pressed={view === "calendar"}
            className={cn("inline-flex h-9 items-center gap-1 px-3 text-base", view === "calendar" ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:bg-surface")}
          >
            <CalendarBlank size={16} aria-hidden /> {t("docs.table.calendar")}
          </button>
          <button
            onClick={() => setView("gantt")}
            aria-pressed={view === "gantt"}
            className={cn("inline-flex h-9 items-center gap-1 px-3 text-base", view === "gantt" ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:bg-surface")}
          >
            <ChartBar size={16} aria-hidden /> {t("docs.table.gantt")}
          </button>
          <button
            onClick={() => setView("hill")}
            aria-pressed={view === "hill"}
            className={cn("inline-flex h-9 items-center gap-1 px-3 text-base", view === "hill" ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:bg-surface")}
          >
            <ChartLineUp size={16} aria-hidden /> {t("docs.table.hill")}
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <CalendarView table={table} />
      ) : view === "gantt" ? (
        <GanttView table={table} />
      ) : view === "hill" ? (
        <HillView table={table} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                {table.columns.map((c) => (
                  <th key={c.id} scope="col" className="border-b border-border px-2 pb-1 text-base font-semibold text-muted">
                    <span className="inline-flex items-center gap-1">
                      {c.name}
                      {c.type === "formula" ? <span className="text-accent" aria-hidden>ƒ</span> : null}
                      <button
                        onClick={() => deleteTableColumn(table.id, c.id)}
                        aria-label={t("docs.table.deleteColumn")}
                        className="rounded text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <X size={12} aria-hidden />
                      </button>
                    </span>
                  </th>
                ))}
                <th aria-hidden className="border-b border-border" />
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r) => (
                <tr key={r.id}>
                  {table.columns.map((c) => (
                    <td key={c.id} className="border-b border-border px-1 py-1 align-middle">{cell(r, c)}</td>
                  ))}
                  <td className="border-b border-border px-1">
                    <button
                      onClick={() => deleteTableRow(table.id, r.id)}
                      aria-label={t("docs.table.deleteRow")}
                      className="rounded p-1 text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <Trash size={14} aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                {table.columns.map((c) => (
                  <td key={c.id} className="px-2 pt-1 text-base font-semibold text-fg">
                    {c.type === "number" || c.type === "formula" ? `Σ ${Math.round(columnTotal(table, c) * 100) / 100}` : ""}
                  </td>
                ))}
                <td aria-hidden />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={() => addTableRow(table.id)}>
          <Plus size={16} aria-hidden /> {t("docs.table.addRow")}
        </Button>
        <span className="inline-flex items-center gap-1">
          <input
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            placeholder={t("docs.table.newColumn")}
            aria-label={t("docs.table.newColumn")}
            className="h-9 w-32 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none placeholder:text-muted"
          />
          <select
            value={newColType}
            onChange={(e) => setNewColType(e.target.value as ColumnType)}
            aria-label={t("docs.table.addColumn")}
            className="h-9 rounded-md border border-border bg-bg px-2 text-base text-fg"
          >
            {NEW_COL_TYPES.map((ty) => <option key={ty} value={ty}>{ty}</option>)}
          </select>
          <Button
            variant="ghost"
            onClick={() => {
              addTableColumn(table.id, newColName.trim() || t("docs.table.newColumn"), newColType);
              setNewColName("");
            }}
          >
            <Plus size={16} aria-hidden /> {t("docs.table.addColumn")}
          </Button>
        </span>
      </div>
    </Card>
  );
}
