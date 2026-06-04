import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import i18n from "@/i18n";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import {
  normalizeNumber,
  formatNumber,
  evaluateRouting,
  presenceToRouting,
  callerName,
} from "@/features/telephony/routing";
import { useCallStore } from "@/features/telephony/callStore";
import { useSmsStore } from "@/features/telephony/smsStore";
import { usePbxStore } from "@/features/telephony/pbxStore";
import { useDirectoryStore } from "@/features/telephony/directoryStore";
import { fetchLines, fetchVoicemails, fetchSmsThreads } from "@/features/telephony/api";
import { ROUTING_RULES, CONTACTS, QUEUES, IVR_MENUS, SCHEDULE, CALL_HISTORY, LINES } from "@/features/telephony/data";
import { pickAgent, isWithinHours, ivrResolve, monitorAudio, canActOnBehalf, pickAgentBySkill, oldestWaiting, estimatedWaitSec, nextHuntMember } from "@/features/telephony/pbx";
import { HUNT_GROUPS } from "@/features/telephony/data";
import { AttendantConsole } from "@/features/telephony/components/AttendantConsole";
import { classifyCaller, searchContacts, renderTemplate } from "@/features/telephony/routing";
import { matchIntent, receptionistGreeting, resolveAction, captureComplete } from "@/features/telephony/receptionist";
import { useReceptionistStore } from "@/features/telephony/receptionistStore";
import { RECEPTIONIST } from "@/features/telephony/data";
import { computeCallStats, volumeByHour } from "@/features/telephony/analytics";
import { PhoneLayout } from "@/features/telephony/PhoneLayout";
import { ActiveCallBar } from "@/features/telephony/components/ActiveCallBar";
import { Dialer } from "@/features/telephony/components/Dialer";
import { CallAnalytics } from "@/features/telephony/components/CallAnalytics";
import { CallQueuePanel } from "@/features/telephony/components/CallQueuePanel";
import { IVRBuilder } from "@/features/telephony/components/IVRBuilder";
import { Directory } from "@/features/telephony/components/Directory";

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});

beforeEach(() => {
  useCallStore.getState().reset();
  useSmsStore.getState().reset();
  usePbxStore.getState().reset();
  useDirectoryStore.getState().reset();
});

// ── Routing / number domain logic ──────────────────────────────────────────
describe("telephony routing util", () => {
  it("normalizeNumber strips formatting and resolves 00 → +", () => {
    expect(normalizeNumber("(415) 555-1000")).toBe("4155551000");
    expect(normalizeNumber("+1 415 555 1000")).toBe("+14155551000");
    expect(normalizeNumber("00 90 212 555 00")).toBe("+9021255500");
  });

  it("formatNumber renders +1 numbers in national grouping", () => {
    expect(formatNumber("+14155551000")).toBe("+1 (415) 555-1000");
    expect(formatNumber("+9021255500")).toBe("+9021255500"); // non-+1 untouched
  });

  it("evaluateRouting picks the matching condition, else the always catch-all", () => {
    expect(evaluateRouting(ROUTING_RULES, { afterHours: true })?.id).toBe("rr_ah");
    expect(evaluateRouting(ROUTING_RULES, { busy: true })?.id).toBe("rr_busy");
    expect(evaluateRouting(ROUTING_RULES, { noAnswer: true })?.id).toBe("rr_na");
    expect(evaluateRouting(ROUTING_RULES, {})?.id).toBe("rr_all"); // always
  });

  it("presenceToRouting maps availability to an action", () => {
    expect(presenceToRouting("online")).toBe("forward");
    expect(presenceToRouting("away")).toBe("voicemail");
    expect(presenceToRouting("offline")).toBe("voicemail");
  });

  it("callerName resolves a contact or falls back to the formatted number", () => {
    expect(callerName("+16285550199", CONTACTS)).toBe("Jordan Blake");
    expect(callerName("+14155551234", CONTACTS)).toBe("+1 (415) 555-1234");
  });
});

// ── Call state machine ─────────────────────────────────────────────────────
describe("callStore (Call aggregate / state machine)", () => {
  it("place → ringing (outbound, normalized target)", () => {
    useCallStore.getState().place("+1 628 555 0199");
    const call = useCallStore.getState().activeCall!;
    expect(call.direction).toBe("outbound");
    expect(call.to).toBe("+16285550199");
    expect(call.state).toBe("ringing");
  });

  it("answer → active, hold ⇄ resume", () => {
    useCallStore.getState().place("+16285550199");
    useCallStore.getState().answer();
    expect(useCallStore.getState().activeCall!.state).toBe("active");
    useCallStore.getState().hold();
    expect(useCallStore.getState().activeCall!.state).toBe("hold");
    useCallStore.getState().resume();
    expect(useCallStore.getState().activeCall!.state).toBe("active");
  });

  it("hangup ends the call, clears the bar and logs it to history", () => {
    const before = useCallStore.getState().history.length;
    useCallStore.getState().place("+16285550199");
    useCallStore.getState().answer();
    useCallStore.getState().hangup();
    expect(useCallStore.getState().activeCall).toBeNull();
    const hist = useCallStore.getState().history;
    expect(hist.length).toBe(before + 1);
    expect(hist[0].endReason).toBe("completed");
  });

  it("tick increments active call duration", () => {
    useCallStore.getState().place("+16285550199");
    useCallStore.getState().answer();
    useCallStore.getState().tick();
    useCallStore.getState().tick();
    expect(useCallStore.getState().activeCall!.durationSec).toBe(2);
  });

  it("simulateInbound rings an inbound call with resolved caller", () => {
    useCallStore.getState().simulateInbound("+16285550199");
    const call = useCallStore.getState().activeCall!;
    expect(call.direction).toBe("inbound");
    expect(call.state).toBe("ringing");
    expect(call.from).toBe("+16285550199");
  });

  it("applyEvent is idempotent (re-delivered call.placed does not duplicate)", () => {
    const evt = { type: "call.placed" as const, call: { id: "x", lineId: "ln_main", direction: "inbound" as const, from: "+16285550199", to: "+14155551000", state: "ringing" as const, startedAt: Date.now(), durationSec: 0 } };
    useCallStore.getState().applyEvent(evt);
    useCallStore.getState().applyEvent(evt);
    expect(useCallStore.getState().activeCall!.id).toBe("x");
    useCallStore.getState().applyEvent({ type: "call.answered", callId: "x" });
    expect(useCallStore.getState().activeCall!.state).toBe("active");
    useCallStore.getState().applyEvent({ type: "call.ended", callId: "x", reason: "completed" });
    expect(useCallStore.getState().activeCall).toBeNull();
  });
});

// ── SMS ────────────────────────────────────────────────────────────────────
describe("smsStore (SmsThread aggregate)", () => {
  it("send appends an outbound message", () => {
    const id = useSmsStore.getState().threads[0].id;
    const before = useSmsStore.getState().threads[0].messages.length;
    useSmsStore.getState().send(id, "On my way");
    const thread = useSmsStore.getState().threads.find((t) => t.id === id)!;
    expect(thread.messages.length).toBe(before + 1);
    expect(thread.messages.at(-1)!.outbound).toBe(true);
    expect(thread.messages.at(-1)!.body).toBe("On my way");
  });

  it("receive bumps unread; markRead clears it", () => {
    const id = useSmsStore.getState().threads[0].id;
    useSmsStore.getState().receive({ id: "rx", threadId: id, from: "+16285550199", to: "+14155551000", body: "ping", sentAt: Date.now(), outbound: false });
    expect(useSmsStore.getState().threads.find((t) => t.id === id)!.unread).toBeGreaterThan(0);
    useSmsStore.getState().markRead(id);
    expect(useSmsStore.getState().threads.find((t) => t.id === id)!.unread).toBe(0);
  });
});

// ── REST contract mocks ────────────────────────────────────────────────────
describe("telephony API contracts", () => {
  it("fetchLines / fetchVoicemails / fetchSmsThreads resolve their shapes", async () => {
    const lines = await fetchLines();
    expect(lines[0].e164).toBeTruthy();
    expect(lines[0].extensions.length).toBeGreaterThan(0);
    const vms = await fetchVoicemails();
    expect(vms.length).toBeGreaterThan(0);
    const threads = await fetchSmsThreads();
    expect(threads[0].messages.length).toBeGreaterThan(0);
  });
});

// ── Components ──────────────────────────────────────────────────────────────
describe("Phone UI", () => {
  it("PhoneLayout renders the keypad", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PhoneLayout />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "#" })).toBeInTheDocument();
  });

  it("Dialer places a call from typed digits", () => {
    const { container } = render(<Dialer />);
    fireEvent.click(within(container).getByRole("button", { name: "6" }));
    fireEvent.click(within(container).getByRole("button", { name: "2" }));
    fireEvent.click(within(container).getByRole("button", { name: "8" }));
    fireEvent.click(within(container).getByRole("button", { name: "Call" }));
    expect(useCallStore.getState().activeCall).not.toBeNull();
    expect(useCallStore.getState().activeCall!.state).toBe("ringing");
  });

  it("ActiveCallBar shows the active call and hangs up", () => {
    useCallStore.getState().place("+14155551234");
    const { container } = render(
      <MemoryRouter>
        <ActiveCallBar />
      </MemoryRouter>,
    );
    expect(within(container).getByText("+1 (415) 555-1234")).toBeInTheDocument();
    fireEvent.click(within(container).getByRole("button", { name: "Hang up" }));
    expect(useCallStore.getState().activeCall).toBeNull();
  });

  it("ActiveCallBar renders nothing when there is no active call", () => {
    const { container } = render(
      <MemoryRouter>
        <ActiveCallBar />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

// ── P0: PBX domain logic ───────────────────────────────────────────────────
describe("pbx util", () => {
  it("pickAgent round-robin advances and skips unavailable, wrapping", () => {
    const sales = QUEUES.find((q) => q.id === "q_sales")!;
    expect(pickAgent(sales, 0)?.id).toBe("usr_5"); // next available after index 0
    expect(pickAgent(sales, 1)?.id).toBe("usr_1"); // index 2 unavailable → wrap to 0
  });

  it("pickAgent longest-idle returns the most idle available agent", () => {
    const support = QUEUES.find((q) => q.id === "q_support")!;
    expect(pickAgent(support)?.id).toBe("usr_3"); // idle 210 > 60
  });

  it("pickAgent sequential/simultaneous return the first available, ignoring cursor", () => {
    const sales = QUEUES.find((q) => q.id === "q_sales")!;
    expect(pickAgent({ ...sales, strategy: "sequential" }, 5)?.id).toBe("usr_1");
    expect(pickAgent({ ...sales, strategy: "simultaneous" })?.id).toBe("usr_1");
  });

  it("pickAgent rotating wraps like round-robin", () => {
    const sales = QUEUES.find((q) => q.id === "q_sales")!;
    expect(pickAgent({ ...sales, strategy: "rotating" }, 0)?.id).toBe("usr_5");
    expect(pickAgent({ ...sales, strategy: "rotating" }, 1)?.id).toBe("usr_1"); // skip unavailable → wrap
  });

  it("pickAgent weighted picks the highest-weight available agent (Webex parity)", () => {
    const q = {
      ...QUEUES.find((x) => x.id === "q_sales")!,
      strategy: "weighted" as const,
      agents: [
        { id: "a1", name: "A", idleSec: 0, available: true, weight: 1 },
        { id: "a2", name: "B", idleSec: 0, available: false, weight: 9 },
        { id: "a3", name: "C", idleSec: 0, available: true, weight: 5 },
      ],
    };
    expect(pickAgent(q)?.id).toBe("a3"); // highest weight among available (a2 unavailable)
  });

  it("nextHuntMember: all → first available; sequential → next available wraps", () => {
    const all = HUNT_GROUPS.find((g) => g.id === "hg_frontdesk")!;
    expect(nextHuntMember(all)?.id).toBe("usr_1");
    const seq = HUNT_GROUPS.find((g) => g.id === "hg_onsite")!; // usr_4 unavailable
    expect(nextHuntMember(seq, -1)?.id).toBe("usr_3"); // skip unavailable usr_4 at index 0
    expect(nextHuntMember(seq, 1)?.id).toBe("usr_6"); // after index1 → index2
    expect(nextHuntMember({ ...seq, members: [] })).toBeNull();
  });

  it("estimatedWaitSec scales with callers ahead ÷ agents; callbacks freed", () => {
    const q = {
      ...QUEUES.find((x) => x.id === "q_sales")!,
      agents: [{ id: "a1", name: "A", idleSec: 0, available: true }],
      waiting: [
        { id: "w1", from: "+1", since: 1 },
        { id: "w2", from: "+2", since: 2, callbackRequested: true },
      ],
    };
    expect(estimatedWaitSec(q, 180)).toBe(180); // 1 live caller × 180 ÷ 1 agent (callback excluded)
  });

  it("isWithinHours respects weekly windows and holidays", () => {
    expect(isWithinHours(SCHEDULE, new Date(2026, 0, 7, 10, 0))).toBe(true); // Wed 10:00
    expect(isWithinHours(SCHEDULE, new Date(2026, 0, 7, 20, 0))).toBe(false); // Wed 20:00
    expect(isWithinHours(SCHEDULE, new Date(2026, 0, 4, 10, 0))).toBe(false); // Sunday
    expect(isWithinHours(SCHEDULE, new Date(2026, 0, 1, 10, 0))).toBe(false); // holiday
  });

  it("ivrResolve walks the menu tree (submenu / queue / miss)", () => {
    const toSub = ivrResolve(IVR_MENUS, "ivr_main", "2");
    expect(toSub.option?.action).toBe("menu");
    expect(toSub.nextMenu?.id).toBe("ivr_support");
    const toQueue = ivrResolve(IVR_MENUS, "ivr_main", "1");
    expect(toQueue.option?.action).toBe("queue");
    expect(toQueue.nextMenu).toBeUndefined();
    expect(ivrResolve(IVR_MENUS, "ivr_main", "7").option).toBeUndefined();
  });
});

// ── P0: call analytics ─────────────────────────────────────────────────────
describe("call analytics", () => {
  it("computeCallStats aggregates the log", () => {
    const s = computeCallStats(CALL_HISTORY);
    expect(s.total).toBe(4);
    expect(s.inbound).toBe(2);
    expect(s.outbound).toBe(2);
    expect(s.missed).toBe(1);
    expect(s.avgHandleSec).toBe(351); // (214 + 488) / 2
  });

  it("volumeByHour has 24 buckets summing to the call count", () => {
    const buckets = volumeByHour(CALL_HISTORY);
    expect(buckets).toHaveLength(24);
    expect(buckets.reduce((n, b) => n + b.count, 0)).toBe(CALL_HISTORY.length);
  });
});

// ── P0: call-control extensions (park / DTMF / record / conference / warm) ──
describe("callStore P0 controls", () => {
  it("park moves the active call aside; pickup restores it", () => {
    useCallStore.getState().place("+16285550199");
    useCallStore.getState().answer();
    useCallStore.getState().park();
    expect(useCallStore.getState().activeCall).toBeNull();
    expect(useCallStore.getState().parkedCalls.length).toBe(1);
    const id = useCallStore.getState().parkedCalls[0].id;
    useCallStore.getState().pickup(id);
    expect(useCallStore.getState().activeCall).not.toBeNull();
    expect(useCallStore.getState().parkedCalls.length).toBe(0);
  });

  it("sendDtmf accumulates digits on the active call", () => {
    useCallStore.getState().place("+16285550199");
    useCallStore.getState().answer();
    useCallStore.getState().sendDtmf("1");
    useCallStore.getState().sendDtmf("2");
    expect(useCallStore.getState().activeCall!.dtmf).toBe("12");
  });

  it("toggleHoldMusic flips the music-on-hold setting", () => {
    expect(useCallStore.getState().holdMusic).toBe(true);
    useCallStore.getState().toggleHoldMusic();
    expect(useCallStore.getState().holdMusic).toBe(false);
  });

  it("toggleRecording flips state and logs a Recording with consent", () => {
    useCallStore.getState().place("+16285550199");
    useCallStore.getState().answer();
    useCallStore.getState().toggleRecording();
    expect(useCallStore.getState().activeCall!.recording).toBe(true);
    expect(useCallStore.getState().recordings.length).toBe(1);
    expect(useCallStore.getState().recordings[0].consent).toBe(true);
    useCallStore.getState().toggleRecording();
    expect(useCallStore.getState().activeCall!.recording).toBe(false);
  });

  it("addToCall merges a participant (conference)", () => {
    useCallStore.getState().place("+16285550199");
    useCallStore.getState().answer();
    useCallStore.getState().addToCall("+1 202 555 0188");
    expect(useCallStore.getState().activeCall!.participants).toContain("+12025550188");
  });

  it("warm transfer: consult holds the call; complete hands off; merge conferences; cancel resumes", () => {
    // consult + complete (blind handoff after consult)
    useCallStore.getState().place("+16285550199");
    useCallStore.getState().answer();
    useCallStore.getState().startConsult("+12025550188");
    expect(useCallStore.getState().consult?.to).toBe("+12025550188");
    expect(useCallStore.getState().activeCall!.state).toBe("hold");
    useCallStore.getState().completeTransfer();
    expect(useCallStore.getState().activeCall).toBeNull();
    expect(useCallStore.getState().consult).toBeNull();

    // consult + merge (conference)
    useCallStore.getState().place("+16285550199");
    useCallStore.getState().answer();
    useCallStore.getState().startConsult("+12025550188");
    useCallStore.getState().mergeConsult();
    expect(useCallStore.getState().activeCall!.state).toBe("active");
    expect(useCallStore.getState().activeCall!.participants).toContain("+12025550188");
    expect(useCallStore.getState().consult).toBeNull();

    // consult + cancel (resume)
    useCallStore.getState().startConsult("+12025550188");
    useCallStore.getState().cancelConsult();
    expect(useCallStore.getState().consult).toBeNull();
    expect(useCallStore.getState().activeCall!.state).toBe("active");
  });
});

// ── P0: queue store ────────────────────────────────────────────────────────
describe("pbxStore (queues)", () => {
  it("enqueue adds a waiting caller; assignNext picks an agent and dequeues", () => {
    usePbxStore.getState().enqueue("q_sales", "+19995550000");
    const before = usePbxStore.getState().queues.find((q) => q.id === "q_sales")!.waiting.length;
    const res = usePbxStore.getState().assignNext("q_sales");
    expect(res?.agent).toBeTruthy();
    const after = usePbxStore.getState().queues.find((q) => q.id === "q_sales")!.waiting.length;
    expect(after).toBe(before - 1);
  });

  it("oldestWaiting returns the earliest-since caller; groupPickup dequeues it", () => {
    usePbxStore.getState().enqueue("q_sales", "+19995550001");
    usePbxStore.getState().enqueue("q_sales", "+19995550002");
    const q = usePbxStore.getState().queues.find((x) => x.id === "q_sales")!;
    const oldest = oldestWaiting(q)!;
    expect(oldest.since).toBe(Math.min(...q.waiting.map((w) => w.since)));
    const before = q.waiting.length;
    const picked = usePbxStore.getState().groupPickup("q_sales");
    expect(picked?.id).toBe(oldest.id);
    expect(usePbxStore.getState().queues.find((x) => x.id === "q_sales")!.waiting.length).toBe(before - 1);
    expect(oldestWaiting({ ...q, waiting: [] })).toBeNull();
  });

  it("requestCallback flags a waiting caller for callback", () => {
    usePbxStore.getState().enqueue("q_sales", "+19995550009");
    const w = usePbxStore.getState().queues.find((x) => x.id === "q_sales")!.waiting.at(-1)!;
    usePbxStore.getState().requestCallback("q_sales", w.id);
    expect(usePbxStore.getState().queues.find((x) => x.id === "q_sales")!.waiting.find((c) => c.id === w.id)!.callbackRequested).toBe(true);
  });

  it("ringHunt advances the sequential cursor across calls", () => {
    expect(usePbxStore.getState().ringHunt("hg_onsite")?.id).toBe("usr_3");
    expect(usePbxStore.getState().ringHunt("hg_onsite")?.id).toBe("usr_6"); // cursor advanced
    expect(usePbxStore.getState().ringHunt("hg_frontdesk")?.id).toBe("usr_1"); // all → first available
  });
});

// ── P0: components ─────────────────────────────────────────────────────────
describe("P0 UI", () => {
  const wrap = (node: ReactNode) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{node}</MemoryRouter>
    </QueryClientProvider>
  );

  it("AttendantConsole renders queues with KPIs", () => {
    render(wrap(<AttendantConsole />));
    expect(screen.getByText("Attendant console")).toBeInTheDocument();
  });

  it("CallAnalytics renders the missed-rate", () => {
    render(wrap(<CallAnalytics />));
    expect(screen.getByText("25%")).toBeInTheDocument(); // 1 missed of 4
  });

  it("CallQueuePanel lists queues", () => {
    render(wrap(<CallQueuePanel />));
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
  });

  it("IVRBuilder lists menus", () => {
    render(wrap(<IVRBuilder />));
    expect(screen.getAllByText("Main attendant").length).toBeGreaterThan(0);
  });

  it("Directory lists contacts", () => {
    render(wrap(<Directory />));
    expect(screen.getByText("Jordan Blake")).toBeInTheDocument();
  });
});

// ── P1: supervisor monitor / delegation / skills ───────────────────────────
describe("P1 pbx util", () => {
  it("monitorAudio describes audibility per mode", () => {
    expect(monitorAudio("listen")).toMatchObject({
      supervisorHearsParties: true,
      agentHearsSupervisor: false,
      customerHearsSupervisor: false,
      agentConnected: true,
    });
    expect(monitorAudio("whisper").agentHearsSupervisor).toBe(true);
    expect(monitorAudio("whisper").customerHearsSupervisor).toBe(false);
    expect(monitorAudio("barge").customerHearsSupervisor).toBe(true);
    expect(monitorAudio("takeover").agentConnected).toBe(false);
  });

  it("canActOnBehalf reflects delegate grants", () => {
    const d = LINES[0].delegates!.find((x) => x.id === "usr_3")!; // answer yes, place no
    expect(canActOnBehalf(d, "answer")).toBe(true);
    expect(canActOnBehalf(d, "place")).toBe(false);
  });

  it("pickAgentBySkill restricts to skilled available agents", () => {
    const sales = QUEUES.find((q) => q.id === "q_sales")!;
    const a = pickAgentBySkill(sales, "demo");
    expect(a?.skills).toContain("demo");
    expect(a?.available).toBe(true);
    expect(pickAgentBySkill(sales, "nonexistent")).toBeNull();
  });
});

// ── P1: caller reputation / directory / templates ──────────────────────────
describe("P1 routing util", () => {
  it("classifyCaller labels trusted / unknown / spam / blocked", () => {
    expect(classifyCaller("+16285550199", { contacts: CONTACTS, blocklist: [] })).toBe("trusted");
    expect(classifyCaller("+19995550000", { contacts: CONTACTS, blocklist: [] })).toBe("unknown");
    expect(classifyCaller("+10000000000", { contacts: CONTACTS, blocklist: [] })).toBe("spam");
    expect(classifyCaller("+16285550199", { contacts: CONTACTS, blocklist: ["+16285550199"] })).toBe("blocked");
  });

  it("searchContacts matches name and number", () => {
    expect(searchContacts(CONTACTS, "jordan").map((c) => c.id)).toContain("ct_jordan");
    expect(searchContacts(CONTACTS, "0142").length).toBeGreaterThan(0);
  });

  it("renderTemplate substitutes known vars and keeps unknown", () => {
    expect(renderTemplate("Hi {{name}}, code {{code}}", { name: "Sam" })).toBe("Hi Sam, code {{code}}");
  });
});

// ── P1: callStore (monitor / wrap-up / block) ──────────────────────────────
describe("callStore P1", () => {
  it("setMonitor / stopMonitor", () => {
    useCallStore.getState().place("+16285550199");
    useCallStore.getState().answer();
    useCallStore.getState().setMonitor("whisper");
    expect(useCallStore.getState().monitor).toBe("whisper");
    useCallStore.getState().stopMonitor();
    expect(useCallStore.getState().monitor).toBeNull();
  });

  it("hangup queues a wrap-up; saveDisposition records it", () => {
    useCallStore.getState().place("+16285550199");
    useCallStore.getState().answer();
    useCallStore.getState().hangup();
    const wrap = useCallStore.getState().pendingWrapUp;
    expect(wrap).not.toBeNull();
    useCallStore.getState().saveDisposition({ callId: wrap!.id, outcome: "resolved", note: "done", tags: ["vip"] });
    expect(useCallStore.getState().pendingWrapUp).toBeNull();
    expect(useCallStore.getState().dispositions[0].outcome).toBe("resolved");
  });

  it("blockNumber / unblock manage the blocklist", () => {
    useCallStore.getState().blockNumber("+19995550000");
    expect(useCallStore.getState().blocklist).toContain("+19995550000");
    useCallStore.getState().unblock("+19995550000");
    expect(useCallStore.getState().blocklist).not.toContain("+19995550000");
  });
});

// ── P1: smsStore (media / template / scheduled) ────────────────────────────
describe("smsStore P1", () => {
  it("sendMedia attaches media (MMS)", () => {
    const id = useSmsStore.getState().threads[0].id;
    useSmsStore.getState().sendMedia(id, "see attached", [{ kind: "image", name: "a.png" }]);
    expect(useSmsStore.getState().threads.find((t) => t.id === id)!.messages.at(-1)!.media?.[0].name).toBe("a.png");
  });

  it("sendTemplate renders variables", () => {
    const id = useSmsStore.getState().threads[0].id;
    useSmsStore.getState().sendTemplate(id, "Hi {{name}}", { name: "Sam" });
    expect(useSmsStore.getState().threads.find((t) => t.id === id)!.messages.at(-1)!.body).toBe("Hi Sam");
  });

  it("scheduleSms queues; flushDue sends due messages", () => {
    const id = useSmsStore.getState().threads[0].id;
    const before = useSmsStore.getState().threads.find((t) => t.id === id)!.messages.length;
    useSmsStore.getState().scheduleSms(id, "later", Date.now() - 1000);
    expect(useSmsStore.getState().scheduled.length).toBe(1);
    useSmsStore.getState().flushDue(Date.now());
    expect(useSmsStore.getState().scheduled.length).toBe(0);
    expect(useSmsStore.getState().threads.find((t) => t.id === id)!.messages.length).toBe(before + 1);
  });
});

// ── P1: skills-based queue assignment + directory favorites ────────────────
describe("pbxStore / directory P1", () => {
  it("assignNextBySkill assigns a skilled agent", () => {
    usePbxStore.getState().enqueue("q_sales", "+19995550000");
    const res = usePbxStore.getState().assignNextBySkill("q_sales", "demo");
    expect(res?.agent.skills).toContain("demo");
  });

  it("toggleFavorite adds/removes speed-dial", () => {
    useDirectoryStore.getState().toggleFavorite("+16285550199");
    expect(useDirectoryStore.getState().favorites).toContain("+16285550199");
    useDirectoryStore.getState().toggleFavorite("+16285550199");
    expect(useDirectoryStore.getState().favorites).not.toContain("+16285550199");
  });
});

describe("AI receptionist (F1) — intent matching & live session", () => {
  it("matchIntent picks the best intent by phrase token overlap", () => {
    const sales = matchIntent("what is your pricing for the plan", RECEPTIONIST.intents);
    expect(sales?.id).toBe("int_sales");
    const support = matchIntent("my account is broken, need help", RECEPTIONIST.intents);
    expect(support?.id).toBe("int_support");
    expect(matchIntent("xyzzy nothing relevant", RECEPTIONIST.intents)).toBeNull();
  });

  it("receptionistGreeting + resolveAction respect hours and fallback", () => {
    expect(receptionistGreeting(RECEPTIONIST, true)).toBe(RECEPTIONIST.greeting);
    expect(receptionistGreeting(RECEPTIONIST, false)).toBe(RECEPTIONIST.afterHoursGreeting);
    expect(resolveAction(RECEPTIONIST, null)).toBe(RECEPTIONIST.fallback);
    const billing = RECEPTIONIST.intents.find((i) => i.id === "int_billing")!;
    expect(resolveAction(RECEPTIONIST, billing)).toBe("route_extension");
  });

  it("captureComplete checks required fields", () => {
    expect(captureComplete(["name", "phone"], { name: "Ada" })).toBe(false);
    expect(captureComplete(["name", "phone"], { name: "Ada", phone: "+90..." })).toBe(true);
  });

  it("simulateCaller appends caller+ai turns and sets the action", () => {
    useReceptionistStore.getState().resetSession();
    useReceptionistStore.getState().simulateCaller("I need pricing for a plan");
    const s = useReceptionistStore.getState().session;
    expect(s.turns.length).toBe(2);
    expect(s.turns[0].who).toBe("caller");
    expect(s.turns[1].who).toBe("ai");
    expect(s.detectedIntentId).toBe("int_sales");
    expect(s.action).toBe("route_queue");
    expect(s.done).toBe(true);
  });

  it("addIntent / removeIntent mutate the config", () => {
    const before = useReceptionistStore.getState().config.intents.length;
    useReceptionistStore.getState().addIntent({ label: "Careers", phrases: ["job", "hiring"], action: "voicemail" });
    const added = useReceptionistStore.getState().config.intents;
    expect(added.length).toBe(before + 1);
    useReceptionistStore.getState().removeIntent(added[added.length - 1].id);
    expect(useReceptionistStore.getState().config.intents.length).toBe(before);
  });
});
