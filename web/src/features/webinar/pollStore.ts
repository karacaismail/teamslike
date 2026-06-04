import { create } from "zustand";
import { POLLS } from "./data";
import type { Poll } from "./types";

let seq = 0;
const newId = () => `pl_${Date.now()}_${seq++}`;
const clone = (): Poll[] => POLLS.map((p) => ({ ...p, options: p.options.map((o) => ({ ...o, votes: [...o.votes] })) }));

interface PollState {
  polls: Poll[];
  launch: (question: string, options: string[]) => void;
  vote: (pollId: string, optionId: string, voter: string) => void;
  close: (pollId: string) => void;
  reset: () => void;
}

export const usePollStore = create<PollState>((set) => ({
  polls: clone(),
  launch: (question, options) =>
    set((s) => ({
      polls: [
        ...s.polls,
        { id: newId(), eventId: "ev_launch", question, state: "live", options: options.map((t, i) => ({ id: `o${i + 1}`, text: t, votes: [] })) },
      ],
    })),
  vote: (pollId, optionId, voter) =>
    set((s) => ({
      polls: s.polls.map((p) =>
        p.id === pollId
          ? {
              ...p,
              options: p.options.map((o) => ({
                ...o,
                votes: o.id === optionId
                  ? o.votes.includes(voter) ? o.votes : [...o.votes, voter]
                  : o.votes.filter((v) => v !== voter), // one vote per voter
              })),
            }
          : p,
      ),
    })),
  close: (pollId) => set((s) => ({ polls: s.polls.map((p) => (p.id === pollId ? { ...p, state: "closed" } : p)) })),
  reset: () => set({ polls: clone() }),
}));
