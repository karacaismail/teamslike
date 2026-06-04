import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import i18n from "@/i18n";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { useEventStore } from "@/features/webinar/eventStore";
import { useQnaStore } from "@/features/webinar/qnaStore";
import { usePollStore } from "@/features/webinar/pollStore";
import { validateRegistration, simulivePosition, segmentAttendees, sortQna, registrationCapacity, nextApproval, admitFromWaitlist, eventStatus } from "@/features/webinar/webinar";
import { ticketsRemaining, isSoldOut, ticketRevenue, formatPrice, agendaByDay, agendaConflicts } from "@/features/webinar/events";
import { useEventsStore } from "@/features/webinar/eventsStore";
import { fetchEvents, submitRegistration } from "@/features/webinar/api";
import { EVENTS, REGISTRATIONS, QNA, TICKET_TIERS, AGENDA } from "@/features/webinar/data";
import { WebinarPage } from "@/features/webinar/WebinarPage";
import { QnaBoard } from "@/features/webinar/components/QnaBoard";
import { RegistrationBuilder } from "@/features/webinar/components/RegistrationBuilder";
import { EventManager } from "@/features/webinar/components/EventManager";

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});

beforeEach(() => {
  useEventStore.getState().reset();
  useQnaStore.getState().reset();
  usePollStore.getState().reset();
});

// ── Pure webinar domain logic ──────────────────────────────────────────────
describe("webinar util", () => {
  const fields = EVENTS[0].registrationFields;

  it("validateRegistration flags required + invalid email", () => {
    const bad = validateRegistration(fields, { name: "Sam", email: "nope", role: "" });
    expect(bad.ok).toBe(false);
    expect(bad.errors.email).toBeTruthy();
    expect(bad.errors.role).toBeTruthy();
    const good = validateRegistration(fields, { name: "Sam", email: "s@x.co", role: "Engineer" });
    expect(good.ok).toBe(true);
  });

  it("simulivePosition computes elapsed / pct / live", () => {
    expect(simulivePosition(0, 30_000, 120)).toMatchObject({ elapsedSec: 30, pct: 25, live: true });
    const ended = simulivePosition(0, 130_000, 120);
    expect(ended.elapsedSec).toBe(120);
    expect(ended.live).toBe(false);
  });

  it("segmentAttendees computes no-show + show rate", () => {
    const s = segmentAttendees(REGISTRATIONS.filter((r) => r.eventId === "ev_launch"));
    expect(s.registered).toBe(5);
    expect(s.attended).toBe(3);
    expect(s.noShow).toBe(1);
    expect(s.showRate).toBeCloseTo(0.6, 5);
  });

  it("sortQna orders by upvotes desc", () => {
    const ids = sortQna(QNA).map((q) => q.id);
    expect(ids[0]).toBe("q3"); // 5 upvotes
    expect(ids[1]).toBe("q1"); // 3
    expect(ids[2]).toBe("q2"); // 1
  });

  it("eventStatus maps upcoming / live / ended (surfaced in EventBuilder badge)", () => {
    const now = 1_000_000;
    expect(eventStatus(now + 60_000, 600, now)).toBe("upcoming");
    expect(eventStatus(now - 60_000, 600, now)).toBe("live");
    expect(eventStatus(now - 700_000, 600, now)).toBe("ended");
  });
});

describe("town hall capacity + approval/waitlist (Teams parity)", () => {
  const townhall = EVENTS.find((e) => e.id === "ev_townhall")!;

  it("registrationCapacity reports interactive / view-only / waitlist / pending", () => {
    const cap = registrationCapacity(townhall, REGISTRATIONS);
    expect(cap.interactive.limit).toBe(3000);
    expect(cap.interactive.used).toBe(2); // th1, th2 approved
    expect(cap.pending).toBe(2); // th3, th4
    expect(cap.waitlisted).toBe(1); // th5
    expect(cap.viewOnly?.limit).toBe(10_000);
  });

  it("nextApproval pends when approval required, waitlists when interactive full", () => {
    expect(nextApproval(townhall, REGISTRATIONS)).toBe("pending"); // requireApproval
    const open = { ...townhall, requireApproval: false, capacity: 2 };
    expect(nextApproval(open, REGISTRATIONS)).toBe("waitlisted"); // 2 approved == capacity 2
    const roomy = { ...townhall, requireApproval: false, capacity: 50 };
    expect(nextApproval(roomy, REGISTRATIONS)).toBe("approved");
  });

  it("admitFromWaitlist returns the first waitlisted registration", () => {
    const next = admitFromWaitlist(REGISTRATIONS.filter((r) => r.eventId === "ev_townhall"));
    expect(next?.id).toBe("th5");
    expect(admitFromWaitlist(REGISTRATIONS.filter((r) => r.eventId === "ev_launch"))).toBeNull();
  });
});

describe("eventStore approval queue", () => {
  it("approve / reject / admitNext mutate town-hall registrations", () => {
    useEventStore.getState().setEvent("ev_townhall");
    useEventStore.getState().approveRegistration("th3");
    expect(useEventStore.getState().registrations.find((r) => r.id === "th3")!.approval).toBe("approved");
    useEventStore.getState().rejectRegistration("th4");
    expect(useEventStore.getState().registrations.find((r) => r.id === "th4")!.approval).toBe("rejected");
    useEventStore.getState().admitNext(); // promotes th5 (waitlisted)
    expect(useEventStore.getState().registrations.find((r) => r.id === "th5")!.approval).toBe("approved");
  });
});

// ── Stores ─────────────────────────────────────────────────────────────────
describe("eventStore", () => {
  it("setMode switches the runtime mode", () => {
    useEventStore.getState().setMode("simulive");
    expect(useEventStore.getState().mode).toBe("simulive");
  });

  it("goLive / exitLive toggle the attendee phase", () => {
    useEventStore.getState().goLive();
    expect(useEventStore.getState().phase).toBe("live");
    useEventStore.getState().exitLive();
    expect(useEventStore.getState().phase).toBe("console");
  });

  it("register appends a registration", () => {
    const before = useEventStore.getState().registrations.length;
    useEventStore.getState().register({ name: "New Person", email: "n@x.co", role: "Engineer" });
    expect(useEventStore.getState().registrations.length).toBe(before + 1);
  });
});

describe("qnaStore", () => {
  it("ask appends; upvote toggles; answer marks", () => {
    useQnaStore.getState().ask("New question?", "me");
    const item = useQnaStore.getState().items.at(-1)!;
    expect(item.text).toBe("New question?");
    useQnaStore.getState().upvote(item.id, "voter");
    expect(useQnaStore.getState().items.find((q) => q.id === item.id)!.upvotes).toContain("voter");
    useQnaStore.getState().answer(item.id);
    expect(useQnaStore.getState().items.find((q) => q.id === item.id)!.answered).toBe(true);
  });
});

describe("pollStore", () => {
  it("launch creates a live poll; vote adds a voter; close ends it", () => {
    usePollStore.getState().launch("Pick one", ["A", "B"]);
    const poll = usePollStore.getState().polls.at(-1)!;
    expect(poll.state).toBe("live");
    usePollStore.getState().vote(poll.id, poll.options[0].id, "me");
    expect(usePollStore.getState().polls.find((p) => p.id === poll.id)!.options[0].votes).toContain("me");
    usePollStore.getState().close(poll.id);
    expect(usePollStore.getState().polls.find((p) => p.id === poll.id)!.state).toBe("closed");
  });
});

// ── API contracts ───────────────────────────────────────────────────────────
describe("webinar API contracts", () => {
  it("fetchEvents / submitRegistration resolve", async () => {
    const events = await fetchEvents();
    expect(events[0].title).toBeTruthy();
    const reg = await submitRegistration("ev_launch", { name: "Sam", email: "s@x.co" });
    expect(reg.eventId).toBe("ev_launch");
    expect(reg.id).toBeTruthy();
  });
});

// ── Components ──────────────────────────────────────────────────────────────
describe("Webinar UI", () => {
  const wrap = (node: ReactNode) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{node}</MemoryRouter>
    </QueryClientProvider>
  );

  it("WebinarPage renders the event title", () => {
    render(wrap(<WebinarPage />));
    expect(screen.getAllByText(/AURA Product Launch/).length).toBeGreaterThan(0);
  });

  it("QnaBoard lists questions", () => {
    render(wrap(<QnaBoard />));
    expect(screen.getByText(/self-hosted option/)).toBeInTheDocument();
  });

  it("RegistrationBuilder shows the registration fields", () => {
    render(wrap(<RegistrationBuilder />));
    expect(screen.getAllByText(/Work email/).length).toBeGreaterThan(0);
  });

  it("EventManager renders ticket tiers", () => {
    render(wrap(<EventManager />));
    expect(screen.getByText("Ticket tiers")).toBeInTheDocument();
  });
});

describe("Events ticketing/agenda (F5) — pure util", () => {
  it("ticketsRemaining + isSoldOut", () => {
    const vip = TICKET_TIERS.find((t) => t.id === "tt_vip")!;
    expect(ticketsRemaining(vip)).toBe(0);
    expect(isSoldOut(vip)).toBe(true);
    expect(ticketsRemaining(TICKET_TIERS.find((t) => t.id === "tt_pro")!)).toBe(188);
  });

  it("ticketRevenue sums per currency; formatPrice formats", () => {
    const rev = ticketRevenue(TICKET_TIERS);
    expect(rev.USD).toBe(149 * 612);
    expect(rev.EUR).toBe(399 * 120);
    expect(rev.TRY).toBe(2500 * 88);
    expect(formatPrice(149, "USD")).toBe("$149.00");
  });

  it("agendaByDay groups & sorts; agendaConflicts detects overlap", () => {
    const days = agendaByDay(AGENDA);
    expect(days.map((d) => d.day)).toEqual(["Day 1", "Day 2"]);
    expect(days[0].items[0].start).toBe("09:00");
    expect(agendaConflicts(AGENDA).length).toBe(0);
    const clash = agendaConflicts([
      { id: "a", day: "D", track: "T", start: "09:00", end: "10:00", title: "A" },
      { id: "b", day: "D", track: "T", start: "09:30", end: "10:30", title: "B" },
    ]);
    expect(clash.length).toBe(1);
  });
});

describe("Events ticketing/agenda (F5) — store", () => {
  it("sellTicket respects stock; addTier appends", () => {
    const before = useEventsStore.getState().tiers.find((t) => t.id === "tt_pro")!.sold;
    useEventsStore.getState().sellTicket("tt_pro");
    expect(useEventsStore.getState().tiers.find((t) => t.id === "tt_pro")!.sold).toBe(before + 1);
    useEventsStore.getState().sellTicket("tt_vip"); // sold out → no change
    expect(useEventsStore.getState().tiers.find((t) => t.id === "tt_vip")!.sold).toBe(120);
    const n = useEventsStore.getState().tiers.length;
    useEventsStore.getState().addTier({ name: "Student", currency: "USD", price: 49, quantity: 200 });
    expect(useEventsStore.getState().tiers.length).toBe(n + 1);
  });

  it("addAgendaItem, toggleBadgeField, queueBadges", () => {
    const a = useEventsStore.getState().agenda.length;
    useEventsStore.getState().addAgendaItem({ day: "Day 2", track: "Workshop room", start: "11:00", end: "12:00", title: "Lab" });
    expect(useEventsStore.getState().agenda.length).toBe(a + 1);
    const hadEmail = useEventsStore.getState().badge.fields.includes("email");
    useEventsStore.getState().toggleBadgeField("email");
    expect(useEventsStore.getState().badge.fields.includes("email")).toBe(!hadEmail);
    useEventsStore.getState().queueBadges(["rg1", "rg2"]);
    expect(useEventsStore.getState().printQueue.length).toBe(2);
  });
});
