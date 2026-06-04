/**
 * Docs & Workspace bounded context (Faz 9) — Coda "doc-as-app" + Basecamp +
 * Slack collaboration surfaces (Canvas, Lists, Workflow Builder, Clips).
 * Consumes AI Orchestration. FastAPI-compatible; collab edits stream over WS `doc.*`.
 */

export type BlockType = "heading" | "text" | "todo" | "divider";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // for type "todo"
}

export interface Doc {
  id: string;
  /** Workspace this doc belongs to (J5); undefined = visible everywhere. */
  workspaceId?: string;
  title: string;
  blocks: Block[];
}

export interface Column {
  id: string;
  title: string;
}

export interface Card {
  id: string;
  title: string;
  columnId: string;
  assigneeId?: string;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  cards: Card[];
}

export type WorkflowTrigger = "message" | "schedule" | "reaction";
export type WorkflowStepKind = "send_message" | "assign" | "add_label" | "wait";

export interface WorkflowStep {
  id: string;
  kind: WorkflowStepKind;
  value: string;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
}

export interface StepResult {
  id: string;
  label: string;
  status: "done";
}

/* ───────────── Clips (async video messaging — Loom parity) ─────────────
 * One-click screen/cam capture → cloud → shareable link, with AI summary/
 * chapters/tasks, transcript editing, timestamped comments, CTA, privacy
 * levels and engagement analytics. Parity: Loom.
 */

export type ClipPrivacy = "link" | "workspace" | "people";
export type ClipRecordMode = "screen" | "cam" | "bubble" | "screen_cam";

export interface ClipChapter {
  atSec: number;
  title: string;
}

export interface ClipComment {
  id: string;
  authorId: string;
  atSec: number; // timestamped to a point in the clip
  body: string;
}

export interface ClipReaction {
  emoji: string;
  count: number;
}

export interface Clip {
  id: string;
  title: string;
  authorId: string;
  durationSec: number;
  transcript: string;
  views: number;
  /* Loom-parity additions (optional → fully additive). */
  recordMode?: ClipRecordMode;
  privacy?: ClipPrivacy;
  password?: string;
  /** Public-link expiry (epoch ms); null/undefined = never. */
  linkExpiresAt?: number | null;
  summary?: string; // AI auto-summary
  chapters?: ClipChapter[]; // AI auto-chapters
  tasks?: string[]; // AI auto-tasks (action items)
  fillerRemoved?: boolean; // editing: filler-word removal applied
  silenceRemoved?: boolean; // editing: silence removal applied
  ctaLabel?: string;
  ctaUrl?: string;
  ctaClicks?: number;
  comments?: ClipComment[];
  reactions?: ClipReaction[];
  /** Engagement: average completion 0..1. */
  completionRate?: number;
  hashtags?: string[];
  archived?: boolean;
  /** Variables: number of personalized copies generated. */
  variablesCopies?: number;
}

/**
 * Typed domain events = the collab WS contract (`doc.*`).
 *
 *  DocEdited      → "doc.edited"
 *  CardMoved      → "card.moved"
 *  TodoCompleted  → "todo.completed"
 *  WorkflowRan    → "workflow.ran"
 *  ClipPosted     → "clip.posted"
 */
export type DocsEvent =
  | { type: "doc.edited"; docId: string; blockId: string }
  | { type: "card.moved"; cardId: string; columnId: string }
  | { type: "todo.completed"; blockId: string }
  | { type: "workflow.ran"; workflowId: string }
  | { type: "clip.posted"; clip: Clip }
  | { type: "comment.added"; comment: DocComment };

/* ───────────── Teams "apps": Approvals · Shifts · Forms ───────────── */

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalRequest {
  id: string;
  title: string;
  requesterId: string;
  approverId: string;
  status: ApprovalStatus;
  createdMin: number; // minutes ago
}

export interface Shift {
  id: string;
  userId: string; // "" when open/unassigned
  userName: string;
  day: number; // 0=Sun … 6=Sat
  startMin: number; // minutes from midnight
  endMin: number;
  role: string;
  open?: boolean; // open shift available to claim
}

export interface FormOption {
  id: string;
  text: string;
}

export interface FormDef {
  id: string;
  title: string;
  question: string;
  options: FormOption[];
}

export interface FormResponse {
  id: string;
  formId: string;
  optionId: string;
  responderId: string;
}

/* ───────────── Relational table (Faz 9 — Coda "doc-as-app", TableGrid) ───────────── */

export type ColumnType = "text" | "number" | "date" | "select" | "person" | "formula";

export interface TableColumn {
  id: string;
  name: string;
  type: ColumnType;
  options?: string[]; // for "select"
  formula?: string;   // for "formula", e.g. "Qty * Price"
}

export interface TableRow {
  id: string;
  cells: Record<string, string>; // colId -> raw string value
}

export interface DataTable {
  id: string;
  title: string;
  columns: TableColumn[];
  rows: TableRow[];
}

/* ───────────── Doc collaboration: inline comments + presence (Faz 9) ───────────── */

export interface DocComment {
  id: string;
  docId: string;
  blockId: string;
  authorId: string;
  body: string;
  atMin: number; // minutes ago
  resolved?: boolean;
}
