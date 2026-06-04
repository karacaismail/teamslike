import { create } from "zustand";
import { CANVAS_DOC, CANVAS_PROMPTS } from "./data";
import { buildBlock, matchPrompt, toggleItem as toggleItemUtil } from "./canvas";
import type { CanvasBlock, CanvasDoc, CanvasPrompt } from "./types";

let seq = 100;

const cloneDoc = (): CanvasDoc => ({
  ...CANVAS_DOC,
  collaborators: [...CANVAS_DOC.collaborators],
  blocks: CANVAS_DOC.blocks.map((b) => ({
    ...b,
    sources: [...b.sources],
    items: b.items ? b.items.map((i) => ({ ...i })) : undefined,
  })),
});

interface CanvasState {
  doc: CanvasDoc;
  prompts: CanvasPrompt[];

  /** Generate a block from free-text (matched to the library or a text note). */
  runPrompt: (text: string) => void;
  /** Generate from a specific suggestion chip. */
  runPromptId: (promptId: string) => void;
  removeBlock: (id: string) => void;
  togglePin: (id: string) => void;
  toggleItem: (blockId: string, itemId: string) => void;
  moveBlock: (id: string, dir: "up" | "down") => void;
  renameDoc: (title: string) => void;
  clear: () => void;
}

const touch = (doc: CanvasDoc, blocks: CanvasBlock[]): CanvasDoc => ({
  ...doc,
  blocks,
  updatedAt: Date.now(),
});

export const useCanvasStore = create<CanvasState>((set) => ({
  doc: cloneDoc(),
  prompts: CANVAS_PROMPTS,

  runPrompt: (text) =>
    set((s) => {
      const matched = matchPrompt(text, s.prompts);
      const block = matched
        ? buildBlock(matched, ++seq)
        : ({ id: `cb_${++seq}`, kind: "text", title: text, sources: [], body: text } as CanvasBlock);
      return { doc: touch(s.doc, [block, ...s.doc.blocks]) };
    }),

  runPromptId: (promptId) =>
    set((s) => {
      const p = s.prompts.find((x) => x.id === promptId);
      if (!p) return {};
      return { doc: touch(s.doc, [buildBlock(p, ++seq), ...s.doc.blocks]) };
    }),

  removeBlock: (id) => set((s) => ({ doc: touch(s.doc, s.doc.blocks.filter((b) => b.id !== id)) })),

  togglePin: (id) =>
    set((s) => ({
      doc: touch(
        s.doc,
        s.doc.blocks.map((b) => (b.id === id ? { ...b, pinned: !b.pinned } : b)),
      ),
    })),

  toggleItem: (blockId, itemId) =>
    set((s) => ({
      doc: touch(
        s.doc,
        s.doc.blocks.map((b) => (b.id === blockId ? toggleItemUtil(b, itemId) : b)),
      ),
    })),

  moveBlock: (id, dir) =>
    set((s) => {
      const blocks = [...s.doc.blocks];
      const i = blocks.findIndex((b) => b.id === id);
      if (i < 0) return {};
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= blocks.length) return {};
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      return { doc: touch(s.doc, blocks) };
    }),

  renameDoc: (title) => set((s) => ({ doc: { ...s.doc, title } })),
  clear: () => set((s) => ({ doc: touch(s.doc, []) })),
}));
