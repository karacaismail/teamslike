import { describe, it, expect } from "vitest";
import { reminderTimes, hasConflict } from "@/features/scheduling/reminders";

describe("scheduling reminders + conflict (Calendly parity)", () => {
  it("reminderTimes returns sorted times before the start", () => {
    const start = Date.UTC(2026, 0, 10, 12, 0, 0);
    const r = reminderTimes(start, [1440, 60]);
    expect(r).toHaveLength(2);
    expect(r[0]).toBe(start - 1440 * 60_000); // 1 day before, earliest first
    expect(r[1]).toBe(start - 60 * 60_000); // 1 hour before
    expect(r.every((t) => t < start)).toBe(true);
  });
  it("hasConflict detects overlapping bookings", () => {
    const base = Date.UTC(2026, 0, 10, 12, 0, 0);
    const existing = [{ startMs: base, durationMin: 30 }];
    expect(hasConflict(existing, base + 15 * 60_000, 30)).toBe(true); // overlaps
    expect(hasConflict(existing, base + 30 * 60_000, 30)).toBe(false); // back-to-back, no overlap
  });
});
