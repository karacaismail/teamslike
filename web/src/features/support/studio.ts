import type { AgentIntent, StudioAgent } from "./types";

/**
 * Pure AI Agent Studio helpers (validation, intent matching, test run, metrics).
 * Framework-free → unit-testable; a real NLU backend would mirror the shapes.
 */

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Best-matching intent by phrase token overlap (or null). */
export function matchAgentIntent(text: string, intents: AgentIntent[]): AgentIntent | null {
  const utter = new Set(tokens(text));
  let best: AgentIntent | null = null;
  let bestScore = 0;
  for (const intent of intents) {
    let score = 0;
    for (const phrase of intent.phrases) {
      const pt = tokens(phrase);
      if (pt.length > 0 && pt.every((t) => utter.has(t))) score += pt.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best;
}

/** Readiness gate before publishing — returns missing requirement keys. */
export function agentReady(agent: StudioAgent): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!agent.name.trim()) missing.push("name");
  if (!agent.goal.trim()) missing.push("goal");
  if (agent.channels.length === 0) missing.push("channels");
  if (agent.intents.length === 0) missing.push("intents");
  return { ok: missing.length === 0, missing };
}

/** Simulate the agent answering an utterance. */
export function runAgentTest(
  agent: StudioAgent,
  utterance: string,
): { intentId?: string; reply: string; resolved: boolean } {
  const intent = matchAgentIntent(utterance, agent.intents);
  if (intent) return { intentId: intent.id, reply: intent.reply, resolved: true };
  // Deflection: no matching intent → hand off, unresolved.
  return { reply: "I'm not sure yet — connecting you with a teammate.", resolved: false };
}

/** Automated-resolution rate 0..1 (resolved ÷ runs). */
export function resolutionRate(agent: StudioAgent): number {
  if (agent.metrics.runs <= 0) return 0;
  return agent.metrics.resolved / agent.metrics.runs;
}
