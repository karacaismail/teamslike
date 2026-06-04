import type { DataTable, TableColumn, TableRow } from "./types";

/**
 * Tiny, safe spreadsheet formula engine for TableGrid (Faz 9). No `eval`:
 * a hand-written tokenizer + recursive-descent parser over arithmetic with
 * column-name references (e.g. "Qty * Price + 10"). Column names resolve to the
 * row's numeric cell value. Throws on malformed input; callers render "#ERR".
 */
type Tok = { t: "num"; v: number } | { t: "id"; v: string } | { t: "op"; v: string };

function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " " || c === "\t") { i++; continue; }
    if ("+-*/()".includes(c)) { toks.push({ t: "op", v: c }); i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      toks.push({ t: "num", v: parseFloat(src.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      toks.push({ t: "id", v: src.slice(i, j) });
      i = j;
      continue;
    }
    throw new Error(`unexpected char: ${c}`);
  }
  return toks;
}

export function evalFormula(formula: string, resolve: (name: string) => number): number {
  const toks = tokenize(formula.replace(/^\s*=/, ""));
  let p = 0;
  const peek = () => toks[p];
  const eat = () => toks[p++];

  function expr(): number {
    let v = term();
    while (peek() && peek().t === "op" && (peek().v === "+" || peek().v === "-")) {
      const op = eat().v;
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function term(): number {
    let v = factor();
    while (peek() && peek().t === "op" && (peek().v === "*" || peek().v === "/")) {
      const op = eat().v;
      const r = factor();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function factor(): number {
    const tk = peek();
    if (!tk) throw new Error("unexpected end");
    if (tk.t === "op" && tk.v === "-") { eat(); return -factor(); }
    if (tk.t === "op" && tk.v === "(") {
      eat();
      const v = expr();
      if (!peek() || peek().v !== ")") throw new Error("missing )");
      eat();
      return v;
    }
    if (tk.t === "num") { eat(); return tk.v; }
    if (tk.t === "id") { eat(); return resolve(tk.v); }
    throw new Error("unexpected token");
  }

  const out = expr();
  if (p !== toks.length) throw new Error("trailing tokens");
  if (!Number.isFinite(out)) throw new Error("non-finite result");
  return out;
}

/** Display value for a cell: raw value, or the computed formula (rounded). */
export function computeCell(table: DataTable, row: TableRow, col: TableColumn): string {
  if (col.type !== "formula" || !col.formula) return row.cells[col.id] ?? "";
  try {
    const resolve = (name: string): number => {
      const c = table.columns.find((x) => x.name.toLowerCase() === name.toLowerCase());
      return c ? parseFloat(row.cells[c.id] ?? "") || 0 : 0;
    };
    return String(Math.round(evalFormula(col.formula, resolve) * 100) / 100);
  } catch {
    return "#ERR";
  }
}

/** Footer total for number/formula columns. */
export function columnTotal(table: DataTable, col: TableColumn): number {
  return table.rows.reduce((sum, r) => sum + (parseFloat(computeCell(table, r, col)) || 0), 0);
}

/* ───────────── Derived views (Calendar lives in components; Gantt + Hill here) ───────────── */

export interface GanttBar {
  id: string;
  label: string;
  startFrac: number; // 0..1 position on the date axis
}

/** Position each row on a date axis (min→max of the first date column). */
export function ganttBars(table: DataTable): GanttBar[] {
  const dateCol = table.columns.find((c) => c.type === "date");
  const labelCol = table.columns.find((c) => c.type === "text") ?? table.columns[0];
  if (!dateCol) return [];
  const times = table.rows
    .map((r) => Date.parse(r.cells[dateCol.id] ?? ""))
    .filter((n) => !Number.isNaN(n));
  if (times.length === 0) return [];
  const min = Math.min(...times);
  const span = Math.max(...times) - min || 1;
  return table.rows.map((r) => {
    const tms = Date.parse(r.cells[dateCol.id] ?? "");
    return {
      id: r.id,
      label: r.cells[labelCol.id] || "—",
      startFrac: Number.isNaN(tms) ? 0 : (tms - min) / span,
    };
  });
}

export interface HillPoint {
  id: string;
  label: string;
  x: number; // 0..1 along the hill
  y: number; // 0..1 height (sin curve, peak at x=0.5)
}

/** Basecamp-style Hill chart from a select/status column: uphill = figuring out,
 *  downhill = executing. */
const HILL_X: Record<string, number> = { todo: 0.15, doing: 0.5, done: 0.85 };

export function hillPoints(table: DataTable): HillPoint[] {
  const statusCol = table.columns.find((c) => c.type === "select");
  const labelCol = table.columns.find((c) => c.type === "text") ?? table.columns[0];
  if (!statusCol) return [];
  return table.rows.map((r) => {
    const x = HILL_X[r.cells[statusCol.id] ?? ""] ?? 0.15;
    return { id: r.id, label: r.cells[labelCol.id] || "—", x, y: Math.sin(x * Math.PI) };
  });
}
