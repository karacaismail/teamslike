import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import i18n from "@/i18n";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { useSchedulingStore } from "@/features/scheduling/schedulingStore";
import { generateSlots, hasConflict, pickRoundRobin, rescheduleBooking } from "@/features/scheduling/slots";
import { fetchEventTypes, fetchSlots } from "@/features/scheduling/api";
import { EVENT_TYPES, SCHEDULES, DESKS } from "@/features/scheduling/data";
import { SchedulingPage } from "@/features/scheduling/SchedulingPage";
import { PublicBookingPage } from "@/features/scheduling/components/PublicBookingPage";
import { deskAvailability, isDeskFree, occupancyRate, slotsOverlap } from "@/features/scheduling/workspace";
import { useWorkspaceStore } from "@/features/scheduling/workspaceStore";
import { WorkspaceReservation } from "@/features/scheduling/components/WorkspaceReservation";
import type { Reservation } from "@/features/scheduling/types";

const schedule = SCHEDULES[0];
const intro = EVENT_TYPES.find((e) => e.id === "et_intro")!;
const dayMs = new Date("2026-06-01T00:00:00").getTime(); // a Monday

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});

beforeEach(() => {
  useSchedulingStore.getState().reset();
});

describe("scheduling slots util", () => {
  it("generateSlots produces duration-sized slots on a working day", () => {
    const slots = generateSlots(schedule, intro, "2026-06-01", 0); // nowMs=0 → no min-notice filter
    expect(slots).toHaveLength(12); // 09:00–16:30 step 40m, last start 16:30
    expect(new Date(slots[0].startMs).getHours()).toBe(9);
    expect(slots[0].endMs - slots[0].startMs).toBe(30 * 60000);
  });

  it("generateSlots returns nothing on weekends / overrides", () => {
    expect(generateSlots(schedule, intro, "2026-05-31", 0)).toHaveLength(0); // Sunday
    expect(generateSlots(schedule, intro, "2026-01-01", 0)).toHaveLength(0); // override unavailable
  });

  it("generateSlots respects min-notice", () => {
    const noon = dayMs + 12 * 60 * 60000;
    const slots = generateSlots(schedule, intro, "2026-06-01", noon); // minNotice 60 → ≥13:00
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every((s) => s.startMs >= dayMs + 13 * 60 * 60000)).toBe(true);
  });

  it("hasConflict detects overlap (not adjacency)", () => {
    const b = [{ startMs: dayMs + 600 * 60000, endMs: dayMs + 630 * 60000 } as never]; // 10:00–10:30
    expect(hasConflict({ startMs: dayMs + 615 * 60000, endMs: dayMs + 645 * 60000 }, b)).toBe(true);
    expect(hasConflict({ startMs: dayMs + 630 * 60000, endMs: dayMs + 660 * 60000 }, b)).toBe(false);
  });

  it("pickRoundRobin rotates hosts", () => {
    expect(pickRoundRobin(["usr_1", "usr_2"], 0)).toBe("usr_2");
    expect(pickRoundRobin(["usr_1", "usr_2"], 1)).toBe("usr_1");
  });

  it("rescheduleBooking moves start/end and flags status", () => {
    const moved = rescheduleBooking({ startMs: 0, endMs: 0, status: "confirmed" } as never, dayMs, 30);
    expect(moved.startMs).toBe(dayMs);
    expect(moved.endMs).toBe(dayMs + 30 * 60000);
    expect(moved.status).toBe("rescheduled");
  });
});

describe("schedulingStore", () => {
  it("book creates a confirmed booking with a host", () => {
    const before = useSchedulingStore.getState().bookings.length;
    useSchedulingStore.getState().book("et_intro", "Sam", "s@x.co", dayMs + 600 * 60000);
    const bookings = useSchedulingStore.getState().bookings;
    expect(bookings.length).toBe(before + 1);
    expect(bookings.at(-1)).toMatchObject({ status: "confirmed", hostId: "usr_1", inviteeName: "Sam" });
  });

  it("round-robin event types rotate the host", () => {
    useSchedulingStore.getState().book("et_strategy", "A", "a@x.co", dayMs + 600 * 60000);
    const host = useSchedulingStore.getState().bookings.at(-1)!.hostId;
    expect(["usr_1", "usr_2"]).toContain(host);
  });

  it("cancel and reschedule update an existing booking", () => {
    useSchedulingStore.getState().reschedule("bk1", dayMs + 660 * 60000);
    expect(useSchedulingStore.getState().bookings.find((b) => b.id === "bk1")!.status).toBe("rescheduled");
    useSchedulingStore.getState().cancel("bk1");
    expect(useSchedulingStore.getState().bookings.find((b) => b.id === "bk1")!.status).toBe("cancelled");
  });

  it("applyEvent booking.cancelled is idempotent-safe", () => {
    useSchedulingStore.getState().applyEvent({ type: "booking.cancelled", bookingId: "bk1" });
    expect(useSchedulingStore.getState().bookings.find((b) => b.id === "bk1")!.status).toBe("cancelled");
  });
});

describe("scheduling API contracts", () => {
  it("fetchEventTypes / fetchSlots resolve", async () => {
    const types = await fetchEventTypes();
    expect(types[0].title).toBeTruthy();
    const slots = await fetchSlots("et_intro", "2026-06-01");
    expect(Array.isArray(slots)).toBe(true);
  });
});

describe("Scheduling UI", () => {
  const wrap = (node: ReactNode) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{node}</MemoryRouter>
    </QueryClientProvider>
  );

  it("SchedulingPage renders an event type", () => {
    render(wrap(<SchedulingPage />));
    expect(screen.getAllByText("Intro call").length).toBeGreaterThan(0);
  });

  it("PublicBookingPage renders the event title", () => {
    render(wrap(<PublicBookingPage />));
    expect(screen.getAllByText(/Intro call/).length).toBeGreaterThan(0);
  });
});

describe("workspace reservation util (Zoom Spaces parity)", () => {
  const day = "2026-06-10";
  const res: Reservation[] = [{ id: "r", deskId: "dsk_a1", userId: "usr_2", dateISO: day, slot: "am", checkedIn: false }];

  it("slotsOverlap: full collides with any, halves only with themselves", () => {
    expect(slotsOverlap("full", "am")).toBe(true);
    expect(slotsOverlap("am", "full")).toBe(true);
    expect(slotsOverlap("am", "am")).toBe(true);
    expect(slotsOverlap("am", "pm")).toBe(false);
  });

  it("isDeskFree respects slot overlap + desk/date scoping", () => {
    expect(isDeskFree(res, "dsk_a1", day, "pm")).toBe(true); // am vs pm → free
    expect(isDeskFree(res, "dsk_a1", day, "am")).toBe(false);
    expect(isDeskFree(res, "dsk_a1", day, "full")).toBe(false); // full overlaps am
    expect(isDeskFree(res, "dsk_a2", day, "full")).toBe(true); // other desk
    expect(isDeskFree(res, "dsk_a1", "2026-06-11", "am")).toBe(true); // other day
  });

  it("deskAvailability annotates free + takenBy", () => {
    const avail = deskAvailability(DESKS, res, day, "am");
    expect(avail).toHaveLength(DESKS.length);
    const a1 = avail.find((d) => d.id === "dsk_a1")!;
    expect(a1.free).toBe(false);
    expect(a1.takenBy?.userId).toBe("usr_2");
    expect(avail.find((d) => d.id === "dsk_a2")!.free).toBe(true);
  });

  it("occupancyRate weighs full as two half-slots, clamps to [0,1]", () => {
    expect(occupancyRate(DESKS, res, day)).toBeCloseTo(1 / (DESKS.length * 2), 5);
    expect(occupancyRate([], res, day)).toBe(0);
    const full: Reservation[] = [{ ...res[0], slot: "full" }];
    expect(occupancyRate(DESKS, full, day)).toBeCloseTo(2 / (DESKS.length * 2), 5);
  });
});

describe("workspaceStore", () => {
  beforeEach(() => useWorkspaceStore.getState().reset());

  it("reserve adds a reservation and blocks colliding slots", () => {
    const s = useWorkspaceStore.getState();
    s.setDate("2026-06-10");
    s.setSlot("full");
    const before = useWorkspaceStore.getState().reservations.length;
    useWorkspaceStore.getState().reserve("dsk_a2");
    expect(useWorkspaceStore.getState().reservations.length).toBe(before + 1);
    useWorkspaceStore.getState().reserve("dsk_a2"); // full vs full → no-op
    expect(useWorkspaceStore.getState().reservations.length).toBe(before + 1);
  });

  it("checkIn flags the reservation; cancel removes it", () => {
    useWorkspaceStore.getState().setDate("2026-06-10");
    useWorkspaceStore.getState().reserve("dsk_b2");
    const mine = useWorkspaceStore.getState().reservations.find((r) => r.deskId === "dsk_b2" && r.dateISO === "2026-06-10")!;
    useWorkspaceStore.getState().checkIn(mine.id);
    expect(useWorkspaceStore.getState().reservations.find((r) => r.id === mine.id)!.checkedIn).toBe(true);
    useWorkspaceStore.getState().cancel(mine.id);
    expect(useWorkspaceStore.getState().reservations.find((r) => r.id === mine.id)).toBeUndefined();
  });
});

describe("WorkspaceReservation UI", () => {
  it("renders the desks panel header", () => {
    useWorkspaceStore.getState().reset();
    render(<WorkspaceReservation />);
    expect(screen.getByText("Desks & rooms")).toBeInTheDocument();
    expect(screen.getByText("My reservations")).toBeInTheDocument();
  });
});
