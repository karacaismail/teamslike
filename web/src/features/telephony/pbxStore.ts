import { create } from "zustand";
import { HUNT_GROUPS, IVR_MENUS, QUEUES, SCHEDULE } from "./data";
import { nextHuntMember, oldestWaiting, pickAgent, pickAgentBySkill } from "./pbx";
import type { BusinessHours, CallQueue, HuntGroup, HuntMember, IVRMenu, QueueAgent, QueuedCall } from "./types";

let seq = 0;
const newId = () => `qc_${Date.now()}_${seq++}`;

const cloneQueues = (): CallQueue[] =>
  QUEUES.map((q) => ({ ...q, agents: q.agents.map((a) => ({ ...a })), waiting: q.waiting.map((w) => ({ ...w })) }));

interface PbxState {
  queues: CallQueue[];
  menus: IVRMenu[];
  schedule: BusinessHours;
  huntGroups: HuntGroup[];
  /** Last assigned agent index per queue (round-robin cursor). */
  rrIndex: Record<string, number>;
  /** Sequential-ring cursor per hunt group. */
  huntIndex: Record<string, number>;

  enqueue: (queueId: string, from: string) => void;
  /** Pop the next waiting caller and pick an agent per the queue strategy. */
  assignNext: (queueId: string) => { agent: QueueAgent; call: QueuedCall } | null;
  /** Pop the next waiting caller and pick a skilled agent (skills-based routing). */
  assignNextBySkill: (queueId: string, skill: string) => { agent: QueueAgent; call: QueuedCall } | null;
  /** Group pickup: grab the oldest waiting caller yourself (no agent routing). */
  groupPickup: (queueId: string) => QueuedCall | null;
  /** Caller opts for a callback instead of holding (frees the live queue). */
  requestCallback: (queueId: string, callId: string) => void;
  /** Ring a hunt group: returns the next member to ring (advances cursor). */
  ringHunt: (groupId: string) => HuntMember | null;
  reset: () => void;
}

export const usePbxStore = create<PbxState>((set, get) => ({
  queues: cloneQueues(),
  menus: IVR_MENUS,
  schedule: SCHEDULE,
  huntGroups: HUNT_GROUPS.map((g) => ({ ...g, members: g.members.map((m) => ({ ...m })) })),
  rrIndex: {},
  huntIndex: {},

  enqueue: (queueId, from) =>
    set((s) => ({
      queues: s.queues.map((q) =>
        q.id === queueId
          ? { ...q, waiting: [...q.waiting, { id: newId(), from, since: Date.now() }] }
          : q,
      ),
    })),

  assignNext: (queueId) => {
    const s = get();
    const q = s.queues.find((x) => x.id === queueId);
    if (!q || q.waiting.length === 0) return null;
    const agent = pickAgent(q, s.rrIndex[queueId] ?? -1);
    if (!agent) return null;
    const call = q.waiting[0];
    const agentIdx = q.agents.findIndex((a) => a.id === agent.id);
    set({
      queues: s.queues.map((x) => (x.id === queueId ? { ...x, waiting: x.waiting.slice(1) } : x)),
      rrIndex: { ...s.rrIndex, [queueId]: agentIdx },
    });
    return { agent, call };
  },

  assignNextBySkill: (queueId, skill) => {
    const s = get();
    const q = s.queues.find((x) => x.id === queueId);
    if (!q || q.waiting.length === 0) return null;
    const agent = pickAgentBySkill(q, skill, s.rrIndex[queueId] ?? -1);
    if (!agent) return null;
    const call = q.waiting[0];
    const agentIdx = q.agents.findIndex((a) => a.id === agent.id);
    set({
      queues: s.queues.map((x) => (x.id === queueId ? { ...x, waiting: x.waiting.slice(1) } : x)),
      rrIndex: { ...s.rrIndex, [queueId]: agentIdx },
    });
    return { agent, call };
  },

  groupPickup: (queueId) => {
    const s = get();
    const q = s.queues.find((x) => x.id === queueId);
    if (!q) return null;
    const call = oldestWaiting(q);
    if (!call) return null;
    set({
      queues: s.queues.map((x) => (x.id === queueId ? { ...x, waiting: x.waiting.filter((w) => w.id !== call.id) } : x)),
    });
    return call;
  },

  requestCallback: (queueId, callId) =>
    set((s) => ({
      queues: s.queues.map((q) =>
        q.id === queueId
          ? { ...q, waiting: q.waiting.map((w) => (w.id === callId ? { ...w, callbackRequested: true } : w)) }
          : q,
      ),
    })),

  ringHunt: (groupId) => {
    const s = get();
    const g = s.huntGroups.find((x) => x.id === groupId);
    if (!g) return null;
    const member = nextHuntMember(g, g.ring === "sequential" ? s.huntIndex[groupId] ?? -1 : -1);
    if (member && g.ring === "sequential") {
      const idx = g.members.findIndex((m) => m.id === member.id);
      set({ huntIndex: { ...s.huntIndex, [groupId]: idx } });
    }
    return member;
  },

  reset: () =>
    set({
      queues: cloneQueues(),
      huntGroups: HUNT_GROUPS.map((g) => ({ ...g, members: g.members.map((m) => ({ ...m })) })),
      rrIndex: {},
      huntIndex: {},
    }),
}));
