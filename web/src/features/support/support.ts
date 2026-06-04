import type { Agent, Conversation, ConversationStatus, KbArticle, Macro, Priority } from "./types";

/** Pure Omnichannel-Support domain helpers — framework-free, unit-testable. */

/** Round-robin agent assignment, skipping unavailable agents (wraps). */
export function pickAgent(agents: Agent[], lastIndex = -1): Agent | null {
  if (agents.length === 0) return null;
  for (let i = 1; i <= agents.length; i++) {
    const idx = (lastIndex + i) % agents.length;
    if (agents[idx].available) return agents[idx];
  }
  return null;
}

export type SlaState = "ok" | "due_soon" | "breached";

/** SLA status: breached if past due, due_soon within 5 minutes, else ok. */
export function slaState(slaDueAt: number, now: number = Date.now()): SlaState {
  if (now >= slaDueAt) return "breached";
  if (slaDueAt - now <= 5 * 60_000) return "due_soon";
  return "ok";
}

export interface MacroPatch {
  reply?: string;
  status?: ConversationStatus;
  priority?: Priority;
  labels?: string[];
  assigneeId?: string;
}

/** Reduce a macro's actions to a single conversation patch (+ optional reply). */
export function expandMacro(macro: Macro): MacroPatch {
  const patch: MacroPatch = {};
  for (const a of macro.actions) {
    if (a.type === "reply") patch.reply = a.value;
    else if (a.type === "status") patch.status = a.value as ConversationStatus;
    else if (a.type === "priority") patch.priority = a.value as Priority;
    else if (a.type === "assign") patch.assigneeId = a.value;
    else if (a.type === "label") patch.labels = [...(patch.labels ?? []), a.value];
  }
  return patch;
}

/** Substitute {{variable}} placeholders in a canned response (unknown kept). */
export function renderCanned(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in vars ? vars[key] : m));
}

/** Average CSAT across rated conversations (0 if none). */
export function csatAverage(convs: Conversation[]): number {
  const rated = convs.filter((c) => typeof c.csat === "number");
  if (rated.length === 0) return 0;
  return Math.round((rated.reduce((n, c) => n + (c.csat ?? 0), 0) / rated.length) * 100) / 100;
}

/** Knowledge-base search over title + body. */
export function searchKb(articles: KbArticle[], q: string): KbArticle[] {
  const s = q.trim().toLowerCase();
  if (!s) return articles;
  return articles.filter((a) => a.title.toLowerCase().includes(s) || a.body.toLowerCase().includes(s));
}
