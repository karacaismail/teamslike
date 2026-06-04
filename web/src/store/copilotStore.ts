import { create } from "zustand";
import type { AgentPlan, CopilotMessage } from "@/types/domain";

interface CopilotState {
  messages: CopilotMessage[];
  streaming: boolean;
  /** Send a prompt with a resolved (i18n) agent plan; simulates a multi-step run. */
  send: (prompt: string, context: string | undefined, plan: AgentPlan) => void;
  clear: () => void;
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Monotonic run token: a new send() or clear() cancels any in-flight run.
let runSeq = 0;

export const useCopilotStore = create<CopilotState>((set) => ({
  messages: [],
  streaming: false,
  send: (prompt, context, plan) => {
    if (!prompt.trim()) return;
    runSeq += 1;
    const myRun = runSeq;
    const assistantId = uid();

    set((s) => ({
      streaming: true,
      messages: [
        ...s.messages,
        { id: uid(), role: "user", text: prompt, context },
        {
          id: assistantId,
          role: "assistant",
          text: "",
          context,
          streaming: true,
          steps: plan.steps.map((label, i) => ({
            id: `${assistantId}-s${i}`,
            label,
            status: i === 0 ? "running" : "pending",
          })),
          suggestions: [],
        },
      ],
    }));

    const patch = (fn: (m: CopilotMessage) => CopilotMessage) =>
      set((s) => ({
        messages: s.messages.map((m) => (m.id === assistantId ? fn(m) : m)),
      }));

    void (async () => {
      // 1) Walk visible agent steps.
      for (let i = 0; i < plan.steps.length; i++) {
        if (myRun !== runSeq) return;
        patch((m) => ({
          ...m,
          steps: m.steps!.map((st, j) => ({
            ...st,
            status: j < i ? "done" : j === i ? "running" : "pending",
          })),
        }));
        await sleep(430);
        if (myRun !== runSeq) return;
        patch((m) => ({
          ...m,
          steps: m.steps!.map((st, j) => ({
            ...st,
            status: j <= i ? "done" : "pending",
          })),
        }));
        await sleep(150);
      }

      // 2) Stream the final answer word-by-word.
      const words = plan.answer.split(" ");
      for (let i = 0; i < words.length; i++) {
        if (myRun !== runSeq) return;
        patch((m) => ({ ...m, text: m.text + (i === 0 ? "" : " ") + words[i] }));
        await sleep(38);
      }

      // 3) Offer follow-up suggestions.
      if (myRun !== runSeq) return;
      patch((m) => ({ ...m, streaming: false, suggestions: plan.suggestions }));
      set({ streaming: false });
    })();
  },
  clear: () => {
    runSeq += 1;
    set({ messages: [], streaming: false });
  },
}));
