import { describe, it, expect } from "vitest";
import { buildIcs } from "@/features/scheduling/ics";

describe("buildIcs (.ics calendar invite — B1)", () => {
  it("emits a VEVENT with UTC start/end derived from duration", () => {
    const ics = buildIcs({ start: Date.UTC(2026, 0, 15, 9, 0, 0), durationMin: 30, title: "Intro call", attendeeEmail: "x@y.com" });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:Intro call");
    expect(ics).toMatch(/DTSTART:20260115T090000Z/);
    expect(ics).toMatch(/DTEND:20260115T093000Z/);
    expect(ics).toContain("mailto:x@y.com");
  });
  it("escapes special chars and omits attendee when absent", () => {
    const ics = buildIcs({ start: Date.UTC(2026, 5, 1, 12, 0, 0), durationMin: 15, title: "A; B, C" });
    expect(ics).toContain("SUMMARY:A\\; B\\, C");
    expect(ics).not.toContain("ATTENDEE");
  });
});
