import { useTranslation } from "react-i18next";
import { useCopilotStore } from "@/store/copilotStore";
import { useUIStore } from "@/store/uiStore";
import { resolveAgentPlan } from "@/data/agentScenarios";

/**
 * Single entry point for triggering the copilot from anywhere: resolves the
 * (i18n) agent plan, opens the dock, and starts a simulated multi-step run.
 */
export function useAskCopilot() {
  const { t } = useTranslation();
  const send = useCopilotStore((s) => s.send);
  const setCopilotOpen = useUIStore((s) => s.setCopilotOpen);

  return (prompt: string, context?: string) => {
    setCopilotOpen(true);
    send(prompt, context, resolveAgentPlan(prompt, t));
  };
}
