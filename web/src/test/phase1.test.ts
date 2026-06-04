import { describe, it, expect, beforeAll } from "vitest";
import i18n from "@/i18n";
import { resolveAgentPlan } from "@/data/agentScenarios";
import { useAuthStore } from "@/store/authStore";
import { DOMAINS } from "@/data/domains";

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

describe("AI orchestration — agent plan resolution", () => {
  it("summarize prompt yields visible steps, an answer and follow-ups", () => {
    const plan = resolveAgentPlan("Summarize my unread activity", i18n.t);
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.answer.length).toBeGreaterThan(0);
    expect(plan.suggestions.length).toBeGreaterThan(0);
  });

  it("translate prompt routes to the translation scenario", () => {
    const plan = resolveAgentPlan("Translate this to Turkish", i18n.t);
    expect(plan.steps[0].toLowerCase()).toContain("detect");
  });
});

describe("IAM — live RBAC tiers", () => {
  it("guest sees only basic domains, no AI, no admin", () => {
    useAuthStore.getState().login("ismail@aura.dev");
    useAuthStore.getState().setRole("guest");
    const { can } = useAuthStore.getState();
    expect(can("messaging.view")).toBe(true);
    expect(can("ai.use")).toBe(false);
    expect(can("admin.access")).toBe(false);
    const visible = DOMAINS.filter((d) => useAuthStore.getState().can(d.requires));
    expect(visible.length).toBe(3);
  });

  it("owner sees every domain", () => {
    useAuthStore.getState().setRole("owner");
    const visible = DOMAINS.filter((d) => useAuthStore.getState().can(d.requires));
    expect(visible.length).toBe(DOMAINS.length);
  });
});
