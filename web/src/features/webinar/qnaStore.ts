import { create } from "zustand";
import { QNA } from "./data";
import type { QnaItem } from "./types";

let seq = 0;
const newId = () => `q_${Date.now()}_${seq++}`;
const clone = (): QnaItem[] => QNA.map((q) => ({ ...q, upvotes: [...q.upvotes] }));

interface QnaState {
  items: QnaItem[];
  ask: (text: string, authorId: string) => void;
  upvote: (id: string, voter: string) => void;
  answer: (id: string) => void;
  reset: () => void;
}

export const useQnaStore = create<QnaState>((set) => ({
  items: clone(),
  ask: (text, authorId) =>
    set((s) => ({
      items: [...s.items, { id: newId(), eventId: "ev_launch", authorId, text, upvotes: [], answered: false, tSec: 0 }],
    })),
  upvote: (id, voter) =>
    set((s) => ({
      items: s.items.map((q) =>
        q.id === id
          ? { ...q, upvotes: q.upvotes.includes(voter) ? q.upvotes.filter((v) => v !== voter) : [...q.upvotes, voter] }
          : q,
      ),
    })),
  answer: (id) => set((s) => ({ items: s.items.map((q) => (q.id === id ? { ...q, answered: true } : q)) })),
  reset: () => set({ items: clone() }),
}));
