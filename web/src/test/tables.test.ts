import { describe, it, expect } from "vitest";
import { evalFormula, computeCell, columnTotal } from "@/features/docs/tables";
import type { DataTable } from "@/features/docs/types";

const tbl: DataTable = {
  id: "t", title: "T",
  columns: [
    { id: "q", name: "Qty", type: "number" },
    { id: "p", name: "Price", type: "number" },
    { id: "tot", name: "Total", type: "formula", formula: "Qty * Price" },
  ],
  rows: [
    { id: "r1", cells: { q: "3", p: "1200" } },
    { id: "r2", cells: { q: "200", p: "8" } },
  ],
};

describe("formula engine (TableGrid — Faz 9)", () => {
  it("evaluates arithmetic with precedence and parens", () => {
    expect(evalFormula("2 + 3 * 4", () => 0)).toBe(14);
    expect(evalFormula("(2 + 3) * 4", () => 0)).toBe(20);
    expect(evalFormula("-5 + 10", () => 0)).toBe(5);
  });
  it("resolves column-name references", () => {
    expect(evalFormula("Qty * Price", (n) => (n === "Qty" ? 3 : 1200))).toBe(3600);
  });
  it("computeCell renders the derived column per row", () => {
    expect(computeCell(tbl, tbl.rows[0], tbl.columns[2])).toBe("3600");
    expect(computeCell(tbl, tbl.rows[1], tbl.columns[2])).toBe("1600");
  });
  it("returns #ERR on malformed formula", () => {
    const bad: DataTable = { ...tbl, columns: [{ id: "x", name: "X", type: "formula", formula: "Qty *" }] };
    expect(computeCell(bad, tbl.rows[0], bad.columns[0])).toBe("#ERR");
  });
  it("columnTotal sums a formula column", () => {
    expect(columnTotal(tbl, tbl.columns[2])).toBe(3600 + 1600);
  });
});

import { ganttBars, hillPoints } from "@/features/docs/tables";

const dated: DataTable = {
  id: "d", title: "D",
  columns: [
    { id: "name", name: "Name", type: "text" },
    { id: "st", name: "Status", type: "select", options: ["todo", "doing", "done"] },
    { id: "due", name: "Due", type: "date" },
  ],
  rows: [
    { id: "a", cells: { name: "A", st: "todo", due: "2026-06-10" } },
    { id: "b", cells: { name: "B", st: "doing", due: "2026-06-20" } },
  ],
};

describe("derived views (Gantt + Hill — Faz 9)", () => {
  it("ganttBars positions rows across the date range", () => {
    const bars = ganttBars(dated);
    expect(bars.find((b) => b.id === "a")!.startFrac).toBe(0);
    expect(bars.find((b) => b.id === "b")!.startFrac).toBe(1);
  });
  it("hillPoints peaks for in-progress items", () => {
    const pts = hillPoints(dated);
    const doing = pts.find((p) => p.id === "b")!;
    const todo = pts.find((p) => p.id === "a")!;
    expect(doing.y).toBeGreaterThan(todo.y); // doing sits near the hilltop
  });
});
