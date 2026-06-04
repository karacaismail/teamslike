import type { TFunction } from "i18next";
import type { AgentPlan, CopilotSuggestion } from "@/types/domain";

type ScenarioKey = "summarize" | "draft" | "translate" | "plan" | "meeting" | "default";

/** Heuristic intent routing for the simulated agent (EN + TR keywords). */
function pickScenario(prompt: string): ScenarioKey {
  const p = prompt.toLowerCase();
  if (/(translat|çevir|tercüme)/.test(p)) return "translate";
  if (/(meeting|toplant|action item|aksiyon)/.test(p)) return "meeting";
  if (/(summar|özet|recap|digest|aktivite)/.test(p)) return "summarize";
  if (/(draft|reply|respond|yanıt|taslak)/.test(p)) return "draft";
  if (/(plan|schedule|agenda|day|gün|planla)/.test(p)) return "plan";
  return "default";
}

/**
 * Resolve a concrete, i18n-translated agent plan (visible steps + final
 * answer + follow-up suggestions). The store consumes only concrete strings;
 * all localization happens here.
 */
export function resolveAgentPlan(prompt: string, t: TFunction): AgentPlan {
  const key = pickScenario(prompt);
  const steps = t(`agent.${key}.steps`, { returnObjects: true }) as unknown as string[];
  const answer = t(`agent.${key}.answer`) as unknown as string;
  const suggestions = t(`agent.${key}.suggestions`, {
    returnObjects: true,
  }) as unknown as CopilotSuggestion[];

  return {
    steps: Array.isArray(steps) ? steps : [],
    answer: typeof answer === "string" ? answer : "",
    suggestions: Array.isArray(suggestions) ? suggestions : [],
  };
}
