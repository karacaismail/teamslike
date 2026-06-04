import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import i18n from "@/i18n";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { useConversationStore } from "@/features/support/conversationStore";
import { useInboxStore } from "@/features/support/inboxStore";
import { pickAgent, slaState, expandMacro, renderCanned, csatAverage, searchKb } from "@/features/support/support";
import { windowState, messageBillable, messageCost, volumeTier, monthlyEstimate, type BillingContext } from "@/features/support/messagingCost";
import { traverse, nextNodeId, danglingTargets, flowStats, nodeById, type BotFlow } from "@/features/support/botflow";
import { useBotflowStore, activeFlow } from "@/features/support/botflowStore";
import { channelOnboardingState, canEnableCoexistence, connectedCount } from "@/features/support/channels";
import { requiredAgents, staffingGap, adherence, scorecardTotal, understaffed } from "@/features/support/wfo";
import { useWfoStore } from "@/features/support/wfoStore";
import { matchAgentIntent, agentReady, runAgentTest, resolutionRate } from "@/features/support/studio";
import { useStudioStore } from "@/features/support/studioStore";
import { SCORECARD, STUDIO_AGENTS } from "@/features/support/data";
import { AgentStudio } from "@/features/support/components/AgentStudio";
import { fetchConversations, aiSuggest } from "@/features/support/api";
import { AGENTS, MACROS, KB_ARTICLES, CONVERSATIONS, INBOXES } from "@/features/support/data";
import { SupportLayout } from "@/features/support/SupportLayout";
import { ConversationList } from "@/features/support/components/ConversationList";
import { CostPanel } from "@/features/support/components/CostPanel";
import { FlowBuilder } from "@/features/support/components/FlowBuilder";
import { ChannelsPanel } from "@/features/support/components/ChannelsPanel";
import { WorkforcePanel } from "@/features/support/components/WorkforcePanel";

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});

beforeEach(() => {
  useConversationStore.getState().reset();
  useInboxStore.getState().reset();
  useBotflowStore.getState().reset();
});

describe("support util", () => {
  it("pickAgent round-robin skips unavailable and wraps", () => {
    expect(pickAgent(AGENTS, 0)?.id).toBe("usr_3");
    expect(pickAgent(AGENTS, 1)?.id).toBe("usr_1"); // usr_4 unavailable → wrap
  });

  it("slaState maps ok / due_soon / breached", () => {
    const now = Date.now();
    expect(slaState(now + 10 * 60000, now)).toBe("ok");
    expect(slaState(now + 2 * 60000, now)).toBe("due_soon");
    expect(slaState(now - 60000, now)).toBe("breached");
  });

  it("expandMacro reduces actions to a patch", () => {
    const patch = expandMacro(MACROS.find((m) => m.id === "mac_refund")!);
    expect(patch.status).toBe("resolved");
    expect(patch.labels).toContain("refund");
    expect(patch.reply).toBeTruthy();
  });

  it("renderCanned substitutes variables", () => {
    expect(renderCanned("Hi {{name}}", { name: "Sam" })).toBe("Hi Sam");
  });

  it("csatAverage averages rated conversations", () => {
    expect(csatAverage(CONVERSATIONS)).toBe(5); // only cv4 rated (5)
  });

  it("searchKb matches title/body", () => {
    expect(searchKb(KB_ARTICLES, "export").map((a) => a.id)).toContain("kb_export");
  });
});

describe("conversationStore", () => {
  it("sendReply appends an outbound agent message", () => {
    const before = useConversationStore.getState().conversations.find((c) => c.id === "cv1")!.messages.length;
    useConversationStore.getState().sendReply("cv1", "On it", "usr_1");
    const conv = useConversationStore.getState().conversations.find((c) => c.id === "cv1")!;
    expect(conv.messages.length).toBe(before + 1);
    expect(conv.messages.at(-1)).toMatchObject({ direction: "out", authorType: "agent", body: "On it" });
  });

  it("addNote appends a private internal note", () => {
    useConversationStore.getState().addNote("cv1", "watch this one", "usr_1");
    expect(useConversationStore.getState().conversations.find((c) => c.id === "cv1")!.messages.at(-1)).toMatchObject({
      private: true,
      authorType: "note",
    });
  });

  it("assignNext sets an assignee; setStatus changes status", () => {
    useConversationStore.getState().assignNext("cv2");
    expect(useConversationStore.getState().conversations.find((c) => c.id === "cv2")!.assigneeId).toBeTruthy();
    useConversationStore.getState().setStatus("cv1", "resolved");
    expect(useConversationStore.getState().conversations.find((c) => c.id === "cv1")!.status).toBe("resolved");
  });

  it("applyMacro applies status + label + reply", () => {
    useConversationStore.getState().applyMacro("cv1", MACROS.find((m) => m.id === "mac_refund")!);
    const conv = useConversationStore.getState().conversations.find((c) => c.id === "cv1")!;
    expect(conv.status).toBe("resolved");
    expect(conv.labels).toContain("refund");
    expect(conv.messages.at(-1)!.authorType).toBe("agent");
  });

  it("submitCsat records a rating", () => {
    useConversationStore.getState().submitCsat("cv1", 4);
    expect(useConversationStore.getState().conversations.find((c) => c.id === "cv1")!.csat).toBe(4);
  });

  it("addLabel / removeLabel mutate conversation labels (wired in ContactPanel)", () => {
    useConversationStore.getState().addLabel("cv1", "vip");
    expect(useConversationStore.getState().conversations.find((c) => c.id === "cv1")!.labels).toContain("vip");
    useConversationStore.getState().removeLabel("cv1", "vip");
    expect(useConversationStore.getState().conversations.find((c) => c.id === "cv1")!.labels).not.toContain("vip");
  });
});

describe("botflowStore — flow switching (wired in FlowBuilder)", () => {
  it("setActiveFlow switches the active flow", () => {
    expect(useBotflowStore.getState().flows.length).toBeGreaterThan(1);
    useBotflowStore.getState().setActiveFlow("flow_lead");
    expect(activeFlow(useBotflowStore.getState()).id).toBe("flow_lead");
    useBotflowStore.getState().reset();
    expect(activeFlow(useBotflowStore.getState()).id).toBe("flow_triage");
  });
});

describe("WhatsApp cost engine (omnichannel parity)", () => {
  it("windowState reports the 24h CSW open/remaining", () => {
    expect(windowState(0, 60)).toMatchObject({ open: true });
    expect(windowState(0, 60).remainingMin).toBe(24 * 60 - 60);
    expect(windowState(0, 24 * 60 + 1).open).toBe(false);
  });

  it("messageBillable frees service + utility-in-window + free entry point", () => {
    expect(messageBillable({ category: "service", withinWindow: true })).toBe(false);
    expect(messageBillable({ category: "utility", withinWindow: true })).toBe(false);
    expect(messageBillable({ category: "utility", withinWindow: false })).toBe(true);
    expect(messageBillable({ category: "marketing", withinWindow: true })).toBe(true);
    expect(messageBillable({ category: "marketing", withinWindow: false, freeEntryPoint: true })).toBe(false);
  });

  it("messageCost uses the TR rate card + volume tier; volumeTier discounts", () => {
    expect(messageCost({ category: "marketing", withinWindow: false }, "TR")).toBe(0.0109);
    expect(messageCost({ category: "service", withinWindow: true }, "TR")).toBe(0);
    expect(volumeTier(0).tier).toBe("standard");
    expect(volumeTier(300_000).tier).toBe("growth");
    expect(volumeTier(2_000_000)).toMatchObject({ tier: "scale", multiplier: 0.8 });
  });

  it("monthlyEstimate sums a traffic mix predictably", () => {
    const mix: BillingContext[] = [
      { category: "marketing", withinWindow: false },
      { category: "service", withinWindow: true },
      { category: "utility", withinWindow: true },
    ];
    expect(monthlyEstimate(mix, "TR")).toBe(0.01); // billed cents: only the marketing msg ($0.0109 → $0.01)
  });
});

describe("no-code bot flow engine (Chatwoot gap)", () => {
  const flow: BotFlow = activeFlow(useBotflowStore.getState());

  it("traverse follows question branches to a terminal node", () => {
    const path = traverse(flow, { n_intent: "Billing" });
    expect(path[0]).toBe("n_welcome");
    expect(path).toContain("n_collect"); // Billing → collect (WhatsApp Flow)
    expect(path.at(-1)).toBe("n_handoff");
  });

  it("nextNodeId resolves message/question/terminal nodes", () => {
    expect(nextNodeId(nodeById(flow, "n_welcome")!)).toBe("n_intent");
    expect(nextNodeId(nodeById(flow, "n_intent")!, { answer: "Technical" })).toBe("n_tech");
    expect(nextNodeId(nodeById(flow, "n_handoff")!)).toBeNull();
  });

  it("flowStats counts kinds; danglingTargets is empty for the seed flow", () => {
    expect(flowStats(flow).question).toBe(1);
    expect(danglingTargets(flow)).toEqual([]);
  });

  it("store add/remove node mutates the active flow", () => {
    const before = activeFlow(useBotflowStore.getState()).nodes.length;
    useBotflowStore.getState().addNode("message");
    expect(activeFlow(useBotflowStore.getState()).nodes.length).toBe(before + 1);
    useBotflowStore.getState().removeNode("n_tech");
    expect(activeFlow(useBotflowStore.getState()).nodes.find((n) => n.id === "n_tech")).toBeUndefined();
  });
});

describe("channel onboarding / coexistence", () => {
  it("channelOnboardingState maps connection → step + progress", () => {
    expect(channelOnboardingState("disconnected")).toMatchObject({ step: "connect", progress: 0 });
    expect(channelOnboardingState("coexistence").step).toBe("migrating");
    expect(channelOnboardingState("connected").progress).toBe(1);
  });

  it("canEnableCoexistence only for verified WhatsApp Cloud API", () => {
    const wa = INBOXES.find((i) => i.id === "ib_wa")!;
    expect(canEnableCoexistence(wa)).toBe(true);
    const mail = INBOXES.find((i) => i.id === "ib_mail")!;
    expect(canEnableCoexistence(mail)).toBe(false);
  });

  it("connectedCount counts connected + coexistence inboxes", () => {
    expect(connectedCount(INBOXES)).toBe(3); // chat, wa(coexistence), mail
  });
});

describe("support API contracts", () => {
  it("fetchConversations / aiSuggest resolve", async () => {
    const convs = await fetchConversations();
    expect(convs.length).toBeGreaterThan(0);
    const suggestion = await aiSuggest("cv2");
    expect(typeof suggestion).toBe("string");
    expect(suggestion.length).toBeGreaterThan(0);
  });
});

describe("Support UI", () => {
  const wrap = (node: ReactNode) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{node}</MemoryRouter>
    </QueryClientProvider>
  );

  it("SupportLayout renders inboxes", () => {
    render(wrap(<SupportLayout />));
    expect(screen.getByText("Website chat")).toBeInTheDocument();
  });

  it("ConversationList renders a contact", () => {
    render(wrap(<ConversationList />));
    expect(screen.getAllByText("Jordan Blake").length).toBeGreaterThan(0);
  });

  it("CostPanel renders the rate card", () => {
    render(wrap(<CostPanel />));
    expect(screen.getByText("Messaging cost")).toBeInTheDocument();
  });

  it("FlowBuilder renders the seed flow", () => {
    render(wrap(<FlowBuilder />));
    expect(screen.getByText(/Support triage/)).toBeInTheDocument();
  });

  it("ChannelsPanel renders the coexistence badge", () => {
    render(wrap(<ChannelsPanel />));
    expect(screen.getByText("Channels")).toBeInTheDocument();
    expect(screen.getAllByText("Coexistence").length).toBeGreaterThan(0);
  });
});

describe("WFO/WEM (F3) — pure util", () => {
  it("requiredAgents uses occupancy-based staffing", () => {
    expect(requiredAgents(25, 240, 1800, 0.85)).toBe(4);
    expect(requiredAgents(0, 240, 1800)).toBe(0);
  });

  it("staffingGap + understaffed flag short intervals", () => {
    expect(staffingGap({ id: "x", label: "", forecastVolume: 0, required: 4, scheduled: 3 })).toBe(-1);
    expect(understaffed([
      { id: "a", label: "", forecastVolume: 0, required: 4, scheduled: 3 },
      { id: "b", label: "", forecastVolume: 0, required: 2, scheduled: 3 },
    ]).length).toBe(1);
  });

  it("adherence + scorecardTotal compute ratios", () => {
    expect(adherence(480, 408)).toBeCloseTo(0.85, 5);
    expect(adherence(0, 10)).toBe(0);
    const perfect = Object.fromEntries(SCORECARD.map((c) => [c.id, 5]));
    expect(scorecardTotal(perfect, SCORECARD)).toBe(100);
  });
});

describe("WFO/WEM (F3) — store", () => {
  it("regenerateForecast + setVolume recompute required agents", () => {
    useWfoStore.getState().setVolume("i_09", 40);
    expect(useWfoStore.getState().intervals.find((i) => i.id === "i_09")!.required).toBe(7);
    useWfoStore.getState().regenerateForecast();
    expect(useWfoStore.getState().intervals.find((i) => i.id === "i_10")!.required).toBe(4);
  });

  it("bumpScheduled adds an agent (self-healing intraday)", () => {
    const before = useWfoStore.getState().intervals.find((i) => i.id === "i_10")!.scheduled;
    useWfoStore.getState().bumpScheduled("i_10");
    expect(useWfoStore.getState().intervals.find((i) => i.id === "i_10")!.scheduled).toBe(before + 1);
  });

  it("addEvaluation appends a quality evaluation", () => {
    const before = useWfoStore.getState().evaluations.length;
    useWfoStore.getState().addEvaluation("usr_1", "cv_1", { sc_greet: 5, sc_resolve: 5, sc_tone: 5, sc_compliance: 5 });
    expect(useWfoStore.getState().evaluations.length).toBe(before + 1);
  });

  it("WorkforcePanel renders the forecast", () => {
    render(<WorkforcePanel />);
    expect(screen.getByText("Forecast & staffing")).toBeInTheDocument();
  });
});

describe("AI Agent Studio (F4) — pure util", () => {
  const agent = STUDIO_AGENTS[0];

  it("matchAgentIntent maps utterances to intents", () => {
    expect(matchAgentIntent("I have an invoice question", agent.intents)?.id).toBe("ai_invoice");
    expect(matchAgentIntent("please reset my password", agent.intents)?.id).toBe("ai_reset");
    expect(matchAgentIntent("totally unrelated", agent.intents)).toBeNull();
  });

  it("agentReady gates publishing", () => {
    expect(agentReady(agent).ok).toBe(true);
    const empty = { ...agent, name: "", channels: [], intents: [] };
    const r = agentReady(empty);
    expect(r.ok).toBe(false);
    expect(r.missing).toContain("name");
    expect(r.missing).toContain("intents");
  });

  it("runAgentTest resolves on match, deflects otherwise; resolutionRate", () => {
    expect(runAgentTest(agent, "refund please").resolved).toBe(true);
    expect(runAgentTest(agent, "zzz").resolved).toBe(false);
    expect(resolutionRate(agent)).toBeCloseTo(318 / 420, 5);
    expect(resolutionRate({ ...agent, metrics: { runs: 0, resolved: 0 } })).toBe(0);
  });
});

describe("AI Agent Studio (F4) — store & render", () => {
  it("AgentStudio renders the agent list", () => {
    render(<AgentStudio />);
    expect(screen.getByText("Agents")).toBeInTheDocument();
  });

  it("selectAgent, setGoal, toggleChannel, addIntent on the active agent", () => {
    useStudioStore.getState().selectAgent("ag_sales");
    expect(useStudioStore.getState().activeAgentId).toBe("ag_sales");
    useStudioStore.getState().setGoal("Qualify leads fast");
    expect(useStudioStore.getState().agents.find((a) => a.id === "ag_sales")!.goal).toBe("Qualify leads fast");
    useStudioStore.getState().toggleChannel("voice");
    expect(useStudioStore.getState().agents.find((a) => a.id === "ag_sales")!.channels).toContain("voice");
    const before = useStudioStore.getState().agents.find((a) => a.id === "ag_sales")!.intents.length;
    useStudioStore.getState().addIntent({ label: "Demo", phrases: ["demo"], reply: "Booking a demo." });
    expect(useStudioStore.getState().agents.find((a) => a.id === "ag_sales")!.intents.length).toBe(before + 1);
  });

  it("runTest appends a sandbox exchange and bumps runs; publish flips status", () => {
    useStudioStore.getState().selectAgent("ag_sales");
    const runsBefore = useStudioStore.getState().agents.find((a) => a.id === "ag_sales")!.metrics.runs;
    useStudioStore.getState().runTest("pricing please");
    expect(useStudioStore.getState().testLog.length).toBe(2);
    expect(useStudioStore.getState().agents.find((a) => a.id === "ag_sales")!.metrics.runs).toBe(runsBefore + 1);
    useStudioStore.getState().publish();
    expect(useStudioStore.getState().agents.find((a) => a.id === "ag_sales")!.status).toBe("published");
  });

  it("createAgent adds and selects a new draft", () => {
    const before = useStudioStore.getState().agents.length;
    useStudioStore.getState().createAgent("Onboarding bot");
    expect(useStudioStore.getState().agents.length).toBe(before + 1);
    expect(useStudioStore.getState().agents.find((a) => a.id === useStudioStore.getState().activeAgentId)!.name).toBe("Onboarding bot");
  });
});
