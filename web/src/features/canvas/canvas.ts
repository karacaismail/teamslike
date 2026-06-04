import type { CanvasBlock, CanvasBlockKind, CanvasDoc, CanvasPrompt } from "./types";

/**
 * Pure AI-Canvas helpers (prompt→block generation, checklist math, stats).
 * Framework-free → unit-testable; a real backend's generator would mirror these
 * shapes. Block bodies are deterministic demo content (UI chrome is i18n'd).
 */

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Match a free-text prompt to the best library entry by keyword overlap. */
export function matchPrompt(text: string, library: CanvasPrompt[]): CanvasPrompt | null {
  const utter = new Set(tokens(text));
  let best: CanvasPrompt | null = null;
  let bestScore = 0;
  for (const p of library) {
    let score = 0;
    for (const kw of p.keywords) {
      const kt = tokens(kw);
      if (kt.length > 0 && kt.every((t) => utter.has(t))) score += kt.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}

/** Deterministic demo content for each block kind. */
function templateFor(kind: CanvasBlockKind, id: string): Partial<CanvasBlock> {
  switch (kind) {
    case "summary":
      return { body: "Synthesized from the last 7 days: momentum is on the launch; SLA healthy; two risks need owners." };
    case "text":
      return { body: "Drafted note — edit inline and share with the team." };
    case "actions":
    case "checklist":
      return {
        items: [
          { id: `${id}_a`, text: "Define the owner and due date", done: false },
          { id: `${id}_b`, text: "Share the draft for review", done: false },
          { id: `${id}_c`, text: "Confirm go/no-go", done: false },
        ],
      };
    case "table":
      return {
        table: {
          columns: ["Channel", "Open", "SLA"],
          rows: [
            ["Live chat", "12", "96%"],
            ["WhatsApp", "8", "91%"],
            ["Email", "5", "88%"],
          ],
        },
      };
    case "metrics":
      return {
        metrics: [
          { label: "Call SLA", value: "94%" },
          { label: "CSAT", value: "4.6/5" },
          { label: "Avg handle", value: "5m 12s" },
        ],
      };
    default:
      return {};
  }
}

/** Build a block from a matched prompt (deterministic, seeded by `seq`). */
export function buildBlock(prompt: CanvasPrompt, seq: number): CanvasBlock {
  const id = `cb_${seq}`;
  return {
    id,
    kind: prompt.kind,
    title: prompt.label,
    sources: [...prompt.sources],
    ...templateFor(prompt.kind, id),
  };
}

/** Toggle a checklist/action item; returns a new block (immutable). */
export function toggleItem(block: CanvasBlock, itemId: string): CanvasBlock {
  if (!block.items) return block;
  return {
    ...block,
    items: block.items.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it)),
  };
}

/** Completion ratio (0..1) for item-bearing blocks; 0 when there are no items. */
export function blockProgress(block: CanvasBlock): number {
  if (!block.items || block.items.length === 0) return 0;
  return block.items.filter((it) => it.done).length / block.items.length;
}

/** Count blocks by kind (header stats). */
export function docCounts(doc: CanvasDoc): Record<CanvasBlockKind, number> {
  const base: Record<CanvasBlockKind, number> = {
    summary: 0,
    actions: 0,
    table: 0,
    checklist: 0,
    metrics: 0,
    text: 0,
  };
  for (const b of doc.blocks) base[b.kind] += 1;
  return base;
}
