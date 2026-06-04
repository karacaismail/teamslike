import { create } from "zustand";
import { BOARD, CLIPS, DOCS, DOC_COMMENTS, TABLES, WORKFLOWS } from "./data";
import { moveCard as moveCardUtil, runWorkflow as runWorkflowUtil, toggleBlock as toggleBlockUtil } from "./docs";
import { autoChapters, autoSummary, extractTasks, removeFillerWords } from "./clips";
import type { Board, BlockType, Clip, ClipPrivacy, ColumnType, DataTable, DocComment, Doc, StepResult, Workflow, WorkflowTrigger } from "./types";

let seq = 0;
const nid = (p: string) => `${p}_${Date.now()}_${seq++}`;

const cloneDocs = (): Doc[] => DOCS.map((d) => ({ ...d, blocks: d.blocks.map((b) => ({ ...b })) }));
const cloneBoard = (): Board => ({ ...BOARD, columns: BOARD.columns.map((c) => ({ ...c })), cards: BOARD.cards.map((c) => ({ ...c })) });
const cloneWorkflows = (): Workflow[] => WORKFLOWS.map((w) => ({ ...w, steps: w.steps.map((s) => ({ ...s })) }));
const cloneClips = (): Clip[] =>
  CLIPS.map((c) => ({
    ...c,
    chapters: c.chapters ? c.chapters.map((ch) => ({ ...ch })) : undefined,
    tasks: c.tasks ? [...c.tasks] : undefined,
    comments: c.comments ? c.comments.map((cm) => ({ ...cm })) : undefined,
    reactions: c.reactions ? c.reactions.map((r) => ({ ...r })) : undefined,
    hashtags: c.hashtags ? [...c.hashtags] : undefined,
  }));

const cloneTables = (): DataTable[] =>
  TABLES.map((tb) => ({
    ...tb,
    columns: tb.columns.map((c) => ({ ...c })),
    rows: tb.rows.map((r) => ({ ...r, cells: { ...r.cells } })),
  }));
const cloneComments = (): DocComment[] => DOC_COMMENTS.map((c) => ({ ...c }));

interface DocsState {
  docs: Doc[];
  board: Board;
  workflows: Workflow[];
  clips: Clip[];
  tables: DataTable[];
  activeTableId: string;
  comments: DocComment[];
  activeDocId: string;
  lastRun: StepResult[] | null;

  setActiveDoc: (id: string) => void;
  addBlock: (docId: string, type: BlockType, content: string) => void;
  editBlock: (docId: string, blockId: string, content: string) => void;
  toggleBlock: (docId: string, blockId: string) => void;
  addCard: (title: string, columnId: string) => void;
  moveCard: (cardId: string, toColumnId: string) => void;
  addWorkflow: (name: string, trigger: WorkflowTrigger) => void;
  runWorkflow: (workflowId: string) => void;
  addClip: (title: string, authorId: string) => void;
  /* Clips — Loom parity (async video) */
  generateAiClip: (id: string) => void; // summary + chapters + tasks
  setClipPrivacy: (id: string, privacy: ClipPrivacy) => void;
  setClipPassword: (id: string, password: string) => void;
  setClipExpiry: (id: string, atMs: number | null) => void;
  addClipComment: (id: string, authorId: string, atSec: number, body: string) => void;
  toggleClipReaction: (id: string, emoji: string) => void;
  setClipCta: (id: string, label: string, url: string) => void;
  removeFiller: (id: string) => void;
  removeSilence: (id: string) => void;
  trimClip: (id: string, durationSec: number) => void;
  archiveClip: (id: string) => void;
  addClipHashtag: (id: string, tag: string) => void;
  createVariables: (id: string, copies: number) => void;
  viewClip: (id: string) => void;
  clickCta: (id: string) => void;
  /* Relational table (TableGrid — Faz 9) */
  setActiveTable: (id: string) => void;
  editCell: (tableId: string, rowId: string, colId: string, value: string) => void;
  addTableRow: (tableId: string) => void;
  addTableColumn: (tableId: string, name: string, type: ColumnType) => void;
  deleteTableRow: (tableId: string, rowId: string) => void;
  deleteTableColumn: (tableId: string, colId: string) => void;
  /* Doc collaboration (comments + simulated concurrent edit) */
  addComment: (docId: string, blockId: string, authorId: string, body: string) => void;
  resolveComment: (id: string) => void;
  applyRemoteEdit: (docId: string) => void;
  reset: () => void;
}

const patchClip = (clips: Clip[], id: string, fn: (c: Clip) => Clip): Clip[] =>
  clips.map((c) => (c.id === id ? fn(c) : c));

export const useDocsStore = create<DocsState>((set, get) => ({
  docs: cloneDocs(),
  board: cloneBoard(),
  workflows: cloneWorkflows(),
  clips: cloneClips(),
  tables: cloneTables(),
  activeTableId: TABLES[0].id,
  comments: cloneComments(),
  activeDocId: DOCS[0].id,
  lastRun: null,

  setActiveDoc: (id) => set({ activeDocId: id }),
  addBlock: (docId, type, content) =>
    set((s) => ({ docs: s.docs.map((d) => (d.id === docId ? { ...d, blocks: [...d.blocks, { id: nid("b"), type, content }] } : d)) })),
  editBlock: (docId, blockId, content) =>
    set((s) => ({
      docs: s.docs.map((d) => (d.id === docId ? { ...d, blocks: d.blocks.map((b) => (b.id === blockId ? { ...b, content } : b)) } : d)),
    })),
  toggleBlock: (docId, blockId) =>
    set((s) => ({ docs: s.docs.map((d) => (d.id === docId ? { ...d, blocks: toggleBlockUtil(d.blocks, blockId) } : d)) })),
  addCard: (title, columnId) =>
    set((s) => ({ board: { ...s.board, cards: [...s.board.cards, { id: nid("cd"), title, columnId }] } })),
  moveCard: (cardId, toColumnId) => set((s) => ({ board: { ...s.board, cards: moveCardUtil(s.board.cards, cardId, toColumnId) } })),
  addWorkflow: (name, trigger) => set((s) => ({ workflows: [...s.workflows, { id: nid("wf"), name, trigger, steps: [] }] })),
  runWorkflow: (workflowId) => {
    const wf = get().workflows.find((w) => w.id === workflowId);
    set({ lastRun: wf ? runWorkflowUtil(wf) : null });
  },
  addClip: (title, authorId) =>
    set((s) => ({
      clips: [
        { id: nid("clip"), title, authorId, durationSec: 42, transcript: "(demo) Screen + camera capture — a real recording flow attaches here once the recorder backend is wired.", views: 0, privacy: "workspace", recordMode: "screen_cam" },
        ...s.clips,
      ],
    })),

  generateAiClip: (id) =>
    set((s) => ({
      clips: patchClip(s.clips, id, (c) => ({
        ...c,
        summary: autoSummary(c.transcript),
        chapters: autoChapters(c.transcript, c.durationSec),
        tasks: extractTasks(c.transcript),
      })),
    })),
  setClipPrivacy: (id, privacy) => set((s) => ({ clips: patchClip(s.clips, id, (c) => ({ ...c, privacy })) })),
  setClipPassword: (id, password) => set((s) => ({ clips: patchClip(s.clips, id, (c) => ({ ...c, password })) })),
  setClipExpiry: (id, atMs) => set((s) => ({ clips: patchClip(s.clips, id, (c) => ({ ...c, linkExpiresAt: atMs })) })),
  addClipComment: (id, authorId, atSec, body) =>
    set((s) => ({
      clips: patchClip(s.clips, id, (c) => ({
        ...c,
        comments: [...(c.comments ?? []), { id: nid("cc"), authorId, atSec, body }],
      })),
    })),
  toggleClipReaction: (id, emoji) =>
    set((s) => ({
      clips: patchClip(s.clips, id, (c) => {
        const existing = c.reactions ?? [];
        const hit = existing.find((r) => r.emoji === emoji);
        return {
          ...c,
          reactions: hit
            ? existing.filter((r) => r.emoji !== emoji)
            : [...existing, { emoji, count: 1 }],
        };
      }),
    })),
  setClipCta: (id, label, url) =>
    set((s) => ({ clips: patchClip(s.clips, id, (c) => ({ ...c, ctaLabel: label, ctaUrl: url, ctaClicks: c.ctaClicks ?? 0 })) })),
  removeFiller: (id) =>
    set((s) => ({
      clips: patchClip(s.clips, id, (c) => ({ ...c, transcript: removeFillerWords(c.transcript), fillerRemoved: true })),
    })),
  removeSilence: (id) =>
    set((s) => ({
      clips: patchClip(s.clips, id, (c) => ({ ...c, silenceRemoved: true, durationSec: Math.round(c.durationSec * 0.9) })),
    })),
  trimClip: (id, durationSec) => set((s) => ({ clips: patchClip(s.clips, id, (c) => ({ ...c, durationSec: Math.max(0, durationSec) })) })),
  archiveClip: (id) => set((s) => ({ clips: patchClip(s.clips, id, (c) => ({ ...c, archived: !c.archived })) })),
  addClipHashtag: (id, tag) =>
    set((s) => ({
      clips: patchClip(s.clips, id, (c) => ({
        ...c,
        hashtags: (c.hashtags ?? []).includes(tag) ? c.hashtags : [...(c.hashtags ?? []), tag],
      })),
    })),
  createVariables: (id, copies) => set((s) => ({ clips: patchClip(s.clips, id, (c) => ({ ...c, variablesCopies: Math.max(0, copies) })) })),
  viewClip: (id) => set((s) => ({ clips: patchClip(s.clips, id, (c) => ({ ...c, views: c.views + 1 })) })),
  clickCta: (id) => set((s) => ({ clips: patchClip(s.clips, id, (c) => ({ ...c, ctaClicks: (c.ctaClicks ?? 0) + 1 })) })),

  setActiveTable: (id) => set({ activeTableId: id }),
  editCell: (tableId, rowId, colId, value) =>
    set((s) => ({
      tables: s.tables.map((tb) =>
        tb.id !== tableId
          ? tb
          : { ...tb, rows: tb.rows.map((r) => (r.id !== rowId ? r : { ...r, cells: { ...r.cells, [colId]: value } })) },
      ),
    })),
  addTableRow: (tableId) =>
    set((s) => ({
      tables: s.tables.map((tb) => (tb.id !== tableId ? tb : { ...tb, rows: [...tb.rows, { id: nid("tr"), cells: {} }] })),
    })),
  addTableColumn: (tableId, name, type) =>
    set((s) => ({
      tables: s.tables.map((tb) => (tb.id !== tableId ? tb : { ...tb, columns: [...tb.columns, { id: nid("c"), name, type }] })),
    })),
  deleteTableRow: (tableId, rowId) =>
    set((s) => ({
      tables: s.tables.map((tb) => (tb.id !== tableId ? tb : { ...tb, rows: tb.rows.filter((r) => r.id !== rowId) })),
    })),
  deleteTableColumn: (tableId, colId) =>
    set((s) => ({
      tables: s.tables.map((tb) => (tb.id !== tableId ? tb : { ...tb, columns: tb.columns.filter((c) => c.id !== colId) })),
    })),

  addComment: (docId, blockId, authorId, body) =>
    set((s) => ({ comments: [{ id: nid("cm"), docId, blockId, authorId, body, atMin: 0 }, ...s.comments] })),
  resolveComment: (id) =>
    set((s) => ({ comments: s.comments.map((c) => (c.id === id ? { ...c, resolved: true } : c)) })),
  // Simulated concurrent edit (CRDT/OT peer stand-in): a teammate edits the
  // first text/heading block; the change merges into the live doc.
  applyRemoteEdit: (docId) =>
    set((s) => ({
      docs: s.docs.map((d) => {
        if (d.id !== docId) return d;
        const target = d.blocks.find((b) => b.type === "text" || b.type === "heading");
        if (!target) return d;
        return { ...d, blocks: d.blocks.map((b) => (b.id === target.id ? { ...b, content: `${b.content} · (Defne)` } : b)) };
      }),
    })),

  reset: () =>
    set({ docs: cloneDocs(), board: cloneBoard(), workflows: cloneWorkflows(), clips: cloneClips(), tables: cloneTables(), activeTableId: TABLES[0].id, comments: cloneComments(), activeDocId: DOCS[0].id, lastRun: null }),
}));
