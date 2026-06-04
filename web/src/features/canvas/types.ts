/**
 * AI Canvas bounded context — a prompt-driven, persistent, collaborative board
 * that synthesizes cross-domain context (meetings, messaging, calling, CX) into
 * editable blocks. Parity: Microsoft Copilot Pages / Webex "AI Canvas".
 *
 * Frontend-only mock: a FastAPI backend would stream block generation and sync
 * multiplayer edits over WS; the UI consumes the shapes below.
 */

export type CanvasBlockKind = "summary" | "actions" | "table" | "checklist" | "metrics" | "text";

/** Domains a block can ground itself in (shown as provenance chips). */
export type CanvasSource = "meetings" | "messaging" | "calling" | "support" | "intelligence" | "docs";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface CanvasTable {
  columns: string[];
  rows: string[][];
}

export interface CanvasMetric {
  label: string;
  value: string;
}

export interface CanvasBlock {
  id: string;
  kind: CanvasBlockKind;
  title: string;
  /** Domains this block synthesized from (grounding chips). */
  sources: CanvasSource[];
  /** Prose body for `summary` / `text`. */
  body?: string;
  /** Items for `actions` / `checklist`. */
  items?: ChecklistItem[];
  table?: CanvasTable;
  metrics?: CanvasMetric[];
  pinned?: boolean;
}

export interface CanvasDoc {
  id: string;
  title: string;
  blocks: CanvasBlock[];
  /** Mock multiplayer presence. */
  collaborators: string[];
  updatedAt: number;
}

/** A prompt suggestion mapped to a block template (keyword-matched). */
export interface CanvasPrompt {
  id: string;
  label: string;
  /** Trigger keywords used to map a free-text prompt to this template. */
  keywords: string[];
  kind: CanvasBlockKind;
  sources: CanvasSource[];
}
