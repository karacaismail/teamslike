import { create } from "zustand";
import type { Story } from "./types";

let seq = 0;
const newId = () => `st_${Date.now()}_${seq++}`;

/** Seed stories (WhatsApp Status / Telegram Stories). */
const SEED: Story[] = [
  { id: "st1", authorId: "usr_2", kind: "text", text: "Shipping the Q3 launch today 🚀", seenBy: [], tMinutes: 35 },
  { id: "st2", authorId: "usr_3", kind: "image", text: "Load test: 12k concurrent ✅", mediaName: "loadtest.png", seenBy: ["usr_1"], tMinutes: 120 },
  { id: "st3", authorId: "usr_4", kind: "text", text: "Dark-mode tokens merged.", seenBy: [], tMinutes: 200 },
];

const clone = (): Story[] => SEED.map((s) => ({ ...s, seenBy: [...s.seenBy] }));

interface StoriesState {
  stories: Story[];
  addStory: (authorId: string, text: string) => void;
  markSeen: (id: string, userId: string) => void;
  reset: () => void;
}

export const useStoriesStore = create<StoriesState>((set) => ({
  stories: clone(),
  addStory: (authorId, text) =>
    set((s) => ({ stories: [{ id: newId(), authorId, kind: "text", text, seenBy: [], tMinutes: 0 }, ...s.stories] })),
  markSeen: (id, userId) =>
    set((s) => ({
      stories: s.stories.map((st) =>
        st.id === id && !st.seenBy.includes(userId) ? { ...st, seenBy: [...st.seenBy, userId] } : st,
      ),
    })),
  reset: () => set({ stories: clone() }),
}));

/** Unseen stories for a viewer. */
export function unseenFor(stories: Story[], userId: string): Story[] {
  return stories.filter((s) => !s.seenBy.includes(userId) && s.authorId !== userId);
}
