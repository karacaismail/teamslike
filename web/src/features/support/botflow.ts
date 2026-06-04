/**
 * No-code visual chatbot flow — the gap competitors (Chatwoot) leave open.
 * A flow is a graph of typed nodes; this module is the pure traversal +
 * validation engine. A `collect` node models a WhatsApp Flow (in-chat form).
 * Framework-free → unit-testable; backend and UI share this contract.
 */

export type BotNodeKind = "message" | "question" | "collect" | "condition" | "handoff" | "end";

export interface BotOption {
  label: string;
  next: string; // target node id
}

export interface BotField {
  id: string;
  label: string;
}

export interface BotNode {
  id: string;
  kind: BotNodeKind;
  text: string; // prompt / message / handoff label
  next?: string; // message · collect · condition fall-through
  options?: BotOption[]; // question branches
  fields?: BotField[]; // collect → WhatsApp Flow form fields
  // condition: vars[variable] === equals ? yes : no
  variable?: string;
  equals?: string;
  yes?: string;
  no?: string;
}

export interface BotFlow {
  id: string;
  name: string;
  startId: string;
  nodes: BotNode[];
}

export const nodeById = (flow: BotFlow, id: string): BotNode | undefined =>
  flow.nodes.find((n) => n.id === id);

export interface StepInput {
  answer?: string; // chosen option label for a question
  vars?: Record<string, string>; // variables for conditions
}

/** Resolve the next node id from a node, or null at a terminal/dead end. */
export function nextNodeId(node: BotNode, input: StepInput = {}): string | null {
  switch (node.kind) {
    case "message":
    case "collect":
      return node.next ?? null;
    case "question": {
      const opt = node.options?.find((o) => o.label === input.answer);
      return opt?.next ?? null;
    }
    case "condition": {
      const hit = (input.vars ?? {})[node.variable ?? ""] === node.equals;
      return (hit ? node.yes : node.no) ?? null;
    }
    case "handoff":
    case "end":
      return null;
  }
}

/**
 * Walk a flow from `startId`, consuming `answers` keyed by node id at question
 * nodes, with `vars` for conditions. Returns the visited node ids (cycle-safe).
 */
export function traverse(flow: BotFlow, answers: Record<string, string> = {}, vars: Record<string, string> = {}): string[] {
  const path: string[] = [];
  const seen = new Set<string>();
  let current: string | null = flow.startId;
  while (current && !seen.has(current)) {
    const node = nodeById(flow, current);
    if (!node) break;
    path.push(current);
    seen.add(current);
    current = nextNodeId(node, { answer: answers[current], vars });
  }
  return path;
}

/** Edge targets that point to a non-existent node (builder validation). */
export function danglingTargets(flow: BotFlow): string[] {
  const ids = new Set(flow.nodes.map((n) => n.id));
  const targets: string[] = [];
  for (const n of flow.nodes) {
    const edges = [n.next, n.yes, n.no, ...(n.options?.map((o) => o.next) ?? [])];
    for (const e of edges) if (e && !ids.has(e)) targets.push(e);
  }
  return targets;
}

/** Count nodes by kind (builder overview). */
export function flowStats(flow: BotFlow): Record<BotNodeKind, number> {
  const stats: Record<BotNodeKind, number> = { message: 0, question: 0, collect: 0, condition: 0, handoff: 0, end: 0 };
  for (const n of flow.nodes) stats[n.kind]++;
  return stats;
}
