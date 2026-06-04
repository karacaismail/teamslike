import type { Block, Card, StepResult, Workflow } from "./types";

/** Pure Docs & Workspace domain helpers — framework-free, unit-testable. */

/** Toggle a todo block's checked state. */
export function toggleBlock(blocks: Block[], id: string): Block[] {
  return blocks.map((b) => (b.id === id && b.type === "todo" ? { ...b, checked: !b.checked } : b));
}

/** Move a card to another column (drag-drop's pure core; keyboard uses the same). */
export function moveCard(cards: Card[], cardId: string, toColumnId: string): Card[] {
  return cards.map((c) => (c.id === cardId ? { ...c, columnId: toColumnId } : c));
}

/** Simulate executing a workflow's steps; returns a per-step result log. */
export function runWorkflow(workflow: Workflow): StepResult[] {
  return workflow.steps.map((s) => ({ id: s.id, label: `${s.kind}: ${s.value}`, status: "done" as const }));
}

export interface DocProgress {
  done: number;
  total: number;
  pct: number; // 0..100
}

/** Completed-todo progress across a doc's blocks. */
export function docProgress(blocks: Block[]): DocProgress {
  const todos = blocks.filter((b) => b.type === "todo");
  const done = todos.filter((b) => b.checked).length;
  const total = todos.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
