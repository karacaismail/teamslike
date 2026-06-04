import { create } from "zustand";
import { STUDIO_AGENTS } from "./data";
import { runAgentTest } from "./studio";
import type { AgentChannel, AgentIntent, AgentTestTurn, StudioAgent } from "./types";

let turnSeq = 0;
let intentSeq = 0;
let agentSeq = 0;

const cloneAgent = (a: StudioAgent): StudioAgent => ({
  ...a,
  channels: [...a.channels],
  knowledge: a.knowledge.map((k) => ({ ...k })),
  tools: a.tools.map((t) => ({ ...t })),
  intents: a.intents.map((i) => ({ ...i, phrases: [...i.phrases] })),
  metrics: { ...a.metrics },
});

interface StudioState {
  agents: StudioAgent[];
  activeAgentId: string;
  testLog: AgentTestTurn[];

  selectAgent: (id: string) => void;
  createAgent: (name: string) => void;
  setName: (name: string) => void;
  setGoal: (goal: string) => void;
  toggleChannel: (channel: AgentChannel) => void;
  toggleTool: (toolId: string) => void;
  addIntent: (intent: Omit<AgentIntent, "id">) => void;
  removeIntent: (id: string) => void;
  publish: () => void;
  /** Run the active agent against a test utterance (updates sandbox + metrics). */
  runTest: (utterance: string) => void;
  resetTest: () => void;
}

const patchActive = (s: StudioState, fn: (a: StudioAgent) => StudioAgent): Partial<StudioState> => ({
  agents: s.agents.map((a) => (a.id === s.activeAgentId ? fn(a) : a)),
});

export const useStudioStore = create<StudioState>((set) => ({
  agents: STUDIO_AGENTS.map(cloneAgent),
  activeAgentId: STUDIO_AGENTS[0].id,
  testLog: [],

  selectAgent: (id) => set({ activeAgentId: id, testLog: [] }),
  createAgent: (name) =>
    set((s) => {
      const agent: StudioAgent = {
        id: `ag_new_${++agentSeq}`,
        name: name.trim() || "New agent",
        goal: "",
        channels: [],
        status: "draft",
        knowledge: [],
        tools: [],
        intents: [],
        metrics: { runs: 0, resolved: 0 },
      };
      return { agents: [...s.agents, agent], activeAgentId: agent.id, testLog: [] };
    }),
  setName: (name) => set((s) => patchActive(s, (a) => ({ ...a, name }))),
  setGoal: (goal) => set((s) => patchActive(s, (a) => ({ ...a, goal }))),
  toggleChannel: (channel) =>
    set((s) =>
      patchActive(s, (a) => ({
        ...a,
        channels: a.channels.includes(channel)
          ? a.channels.filter((c) => c !== channel)
          : [...a.channels, channel],
      })),
    ),
  toggleTool: (toolId) =>
    set((s) =>
      patchActive(s, (a) => ({
        ...a,
        tools: a.tools.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t)),
      })),
    ),
  addIntent: (intent) =>
    set((s) => patchActive(s, (a) => ({ ...a, intents: [...a.intents, { ...intent, id: `ai_new_${++intentSeq}` }] }))),
  removeIntent: (id) =>
    set((s) => patchActive(s, (a) => ({ ...a, intents: a.intents.filter((i) => i.id !== id) }))),
  publish: () => set((s) => patchActive(s, (a) => ({ ...a, status: "published" }))),

  runTest: (utterance) =>
    set((s) => {
      const agent = s.agents.find((a) => a.id === s.activeAgentId);
      if (!agent) return {};
      const res = runAgentTest(agent, utterance);
      const turns: AgentTestTurn[] = [
        ...s.testLog,
        { id: `tt_${++turnSeq}`, who: "user", text: utterance },
        { id: `tt_${++turnSeq}`, who: "agent", text: res.reply, intentId: res.intentId },
      ];
      return {
        testLog: turns,
        agents: s.agents.map((a) =>
          a.id === s.activeAgentId
            ? { ...a, metrics: { runs: a.metrics.runs + 1, resolved: a.metrics.resolved + (res.resolved ? 1 : 0) } }
            : a,
        ),
      };
    }),
  resetTest: () => set({ testLog: [] }),
}));
