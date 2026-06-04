import { create } from "zustand";
import type { BotFlow, BotNode, BotNodeKind } from "./botflow";

let seq = 0;
const nid = () => `n_${Date.now()}_${seq++}`;

const SEED_FLOW: BotFlow = {
  id: "flow_triage",
  name: "Support triage",
  startId: "n_welcome",
  nodes: [
    { id: "n_welcome", kind: "message", text: "Hi! How can we help today?", next: "n_intent" },
    {
      id: "n_intent",
      kind: "question",
      text: "Pick a topic",
      options: [
        { label: "Billing", next: "n_collect" },
        { label: "Technical", next: "n_tech" },
        { label: "Other", next: "n_handoff" },
      ],
    },
    { id: "n_collect", kind: "collect", text: "Billing details", fields: [{ id: "order", label: "Order #" }, { id: "email", label: "Email" }], next: "n_handoff" },
    { id: "n_tech", kind: "message", text: "Try restarting, then check status.aura.dev", next: "n_resolve" },
    { id: "n_resolve", kind: "end", text: "Resolved" },
    { id: "n_handoff", kind: "handoff", text: "Route to a human agent" },
  ],
};

const SEED_FLOW_LEAD: BotFlow = {
  id: "flow_lead",
  name: "Lead capture",
  startId: "l_welcome",
  nodes: [
    { id: "l_welcome", kind: "message", text: "Thanks for your interest!", next: "l_form" },
    { id: "l_form", kind: "collect", text: "Tell us about you", fields: [{ id: "name", label: "Name" }, { id: "company", label: "Company" }], next: "l_route" },
    { id: "l_route", kind: "handoff", text: "Route to sales" },
  ],
};

const DEFAULT_TEXT: Record<BotNodeKind, string> = {
  message: "New message",
  question: "New question",
  collect: "Collect info",
  condition: "New condition",
  handoff: "Hand off to agent",
  end: "End",
};

interface BotflowState {
  flows: BotFlow[];
  activeFlowId: string;
  setActiveFlow: (id: string) => void;
  addNode: (kind: BotNodeKind) => void;
  removeNode: (id: string) => void;
  reset: () => void;
}

const clone = (f: BotFlow): BotFlow => ({ ...f, nodes: f.nodes.map((n) => ({ ...n })) });

export const useBotflowStore = create<BotflowState>((set, get) => ({
  flows: [clone(SEED_FLOW), clone(SEED_FLOW_LEAD)],
  activeFlowId: SEED_FLOW.id,

  setActiveFlow: (id) => set({ activeFlowId: id }),

  addNode: (kind) =>
    set((s) => ({
      flows: s.flows.map((f) =>
        f.id === s.activeFlowId
          ? { ...f, nodes: [...f.nodes, { id: nid(), kind, text: DEFAULT_TEXT[kind] }] }
          : f,
      ),
    })),

  removeNode: (id) =>
    set((s) => ({
      flows: s.flows.map((f) => {
        if (f.id !== s.activeFlowId) return f;
        const nodes = f.nodes
          .filter((n) => n.id !== id)
          .map((n) => ({
            ...n,
            next: n.next === id ? undefined : n.next,
            yes: n.yes === id ? undefined : n.yes,
            no: n.no === id ? undefined : n.no,
            options: n.options?.filter((o) => o.next !== id),
          }));
        return { ...f, nodes };
      }),
    })),

  reset: () => set({ flows: [clone(SEED_FLOW), clone(SEED_FLOW_LEAD)], activeFlowId: SEED_FLOW.id }),
}));

export const activeFlow = (s: BotflowState): BotFlow =>
  s.flows.find((f) => f.id === s.activeFlowId) ?? s.flows[0];
