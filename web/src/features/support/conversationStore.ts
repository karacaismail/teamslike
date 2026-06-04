import { create } from "zustand";
import { capArray } from "@/lib/capArray";
import { AGENTS, CONVERSATIONS } from "./data";
import { expandMacro, pickAgent } from "./support";
import type { Agent, Conversation, ConversationStatus, Macro, MessageItem, Priority, SupportEvent } from "./types";

let seq = 0;
const mid = () => `m_${Date.now()}_${seq++}`;
const clone = (): Conversation[] =>
  CONVERSATIONS.map((c) => ({ ...c, labels: [...c.labels], messages: c.messages.map((m) => ({ ...m })) }));

interface ConvState {
  conversations: Conversation[];
  activeConversationId: string | null;
  agents: Agent[];
  rrIndex: number;

  setActive: (id: string) => void;
  sendReply: (convId: string, text: string, agentId: string) => void;
  addNote: (convId: string, text: string, agentId: string) => void;
  assign: (convId: string, agentId: string) => void;
  assignNext: (convId: string) => void;
  setStatus: (convId: string, status: ConversationStatus) => void;
  setPriority: (convId: string, priority: Priority) => void;
  addLabel: (convId: string, label: string) => void;
  removeLabel: (convId: string, label: string) => void;
  applyMacro: (convId: string, macro: Macro) => void;
  submitCsat: (convId: string, rating: number) => void;
  applyEvent: (evt: SupportEvent) => void;
  reset: () => void;
}

function newMessage(convId: string, partial: Partial<MessageItem>): MessageItem {
  return {
    id: mid(),
    conversationId: convId,
    direction: "out",
    authorType: "agent",
    body: "",
    tMinutes: 0,
    ...partial,
  };
}

export const useConversationStore = create<ConvState>((set, get) => {
  const patch = (convId: string, fn: (c: Conversation) => Conversation) =>
    set((s) => ({ conversations: s.conversations.map((c) => (c.id === convId ? fn(c) : c)) }));
  const append = (convId: string, msg: MessageItem) =>
    patch(convId, (c) => ({ ...c, messages: capArray([...c.messages, msg], 300) }));

  return {
    conversations: clone(),
    activeConversationId: CONVERSATIONS[0]?.id ?? null,
    agents: AGENTS,
    rrIndex: -1,

    setActive: (id) => {
      set({ activeConversationId: id });
      patch(id, (c) => ({ ...c, unread: 0 }));
    },
    sendReply: (convId, text, agentId) =>
      append(convId, newMessage(convId, { direction: "out", authorType: "agent", authorId: agentId, body: text })),
    addNote: (convId, text, agentId) =>
      append(convId, newMessage(convId, { authorType: "note", authorId: agentId, body: text, private: true })),
    assign: (convId, agentId) => patch(convId, (c) => ({ ...c, assigneeId: agentId })),
    assignNext: (convId) => {
      const s = get();
      const agent = pickAgent(s.agents, s.rrIndex);
      if (!agent) return;
      const idx = s.agents.findIndex((a) => a.id === agent.id);
      set({ rrIndex: idx });
      patch(convId, (c) => ({ ...c, assigneeId: agent.id }));
    },
    setStatus: (convId, status) => patch(convId, (c) => ({ ...c, status })),
    setPriority: (convId, priority) => patch(convId, (c) => ({ ...c, priority })),
    addLabel: (convId, label) =>
      patch(convId, (c) => (c.labels.includes(label) ? c : { ...c, labels: [...c.labels, label] })),
    removeLabel: (convId, label) => patch(convId, (c) => ({ ...c, labels: c.labels.filter((l) => l !== label) })),
    applyMacro: (convId, macro) => {
      const p = expandMacro(macro);
      patch(convId, (c) => ({
        ...c,
        status: p.status ?? c.status,
        priority: p.priority ?? c.priority,
        assigneeId: p.assigneeId ?? c.assigneeId,
        labels: p.labels ? Array.from(new Set([...c.labels, ...p.labels])) : c.labels,
      }));
      if (p.reply) append(convId, newMessage(convId, { authorType: "agent", body: p.reply }));
    },
    submitCsat: (convId, rating) => patch(convId, (c) => ({ ...c, csat: rating })),

    applyEvent: (evt) =>
      set((s) => {
        switch (evt.type) {
          case "conversation.opened":
            return s.conversations.some((c) => c.id === evt.conversation.id)
              ? {}
              : { conversations: [evt.conversation, ...s.conversations] };
          case "conversation.assigned":
            return { conversations: s.conversations.map((c) => (c.id === evt.conversationId ? { ...c, assigneeId: evt.assigneeId } : c)) };
          case "conversation.resolved":
            return { conversations: s.conversations.map((c) => (c.id === evt.conversationId ? { ...c, status: "resolved" } : c)) };
          case "message.received":
            return {
              conversations: s.conversations.map((c) =>
                c.id === evt.message.conversationId
                  ? c.messages.some((m) => m.id === evt.message.id)
                    ? c
                    : { ...c, messages: capArray([...c.messages, evt.message], 300), unread: c.unread + 1 }
                  : c,
              ),
            };
          case "csat.submitted":
            return { conversations: s.conversations.map((c) => (c.id === evt.conversationId ? { ...c, csat: evt.rating } : c)) };
          case "ai.suggestion":
            return {}; // surfaced in UI, no state mutation
          default:
            return {};
        }
      }),

    reset: () => set({ conversations: clone(), activeConversationId: CONVERSATIONS[0]?.id ?? null, rrIndex: -1 }),
  };
});
