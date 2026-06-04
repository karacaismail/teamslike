import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import "@/i18n";
import i18n from "@/i18n";
import { attendanceReport, breakoutCountdown, watermarkLabel, searchArchive, MEETING_ARCHIVE } from "@/features/meetings/meetParity";
import { buildAgenda, agendaTotal, agendaProgress, extractActionItems, meetingChapters } from "@/features/meetings/facilitator";
import { useMeetingStore } from "@/features/meetings/store";
import { MeetParityPanel } from "@/features/meetings/components/MeetParityPanel";
import { FacilitatorPanel } from "@/features/meetings/components/FacilitatorPanel";

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

describe("meet parity util", () => {
  it("attendanceReport computes present / no-show / rate", () => {
    const a = attendanceReport(["a", "b", "c", "d"], ["a", "b", "c"]);
    expect(a.invited).toBe(4);
    expect(a.present).toBe(3);
    expect(a.noShow).toBe(1);
    expect(a.rate).toBeCloseTo(0.75, 5);
  });

  it("breakoutCountdown reports remaining + expiry", () => {
    const now = 1_000_000;
    expect(breakoutCountdown(now + 30_000, now)).toMatchObject({ expired: false });
    expect(breakoutCountdown(now + 30_000, now).remainingSec).toBe(30);
    expect(breakoutCountdown(now - 1, now).expired).toBe(true);
  });
});

describe("meetingStore parity flags", () => {
  it("toggles companion + noise cancellation", () => {
    const before = useMeetingStore.getState().companionMode;
    useMeetingStore.getState().toggleCompanion();
    expect(useMeetingStore.getState().companionMode).toBe(!before);
    useMeetingStore.getState().toggleNoiseCancellation();
    expect(useMeetingStore.getState().noiseCancellation).toBe(true);
  });

  it("starts and clears the breakout timer", () => {
    useMeetingStore.getState().startBreakoutTimer(5);
    expect(useMeetingStore.getState().breakoutEndsAt).not.toBeNull();
    useMeetingStore.getState().clearBreakoutTimer();
    expect(useMeetingStore.getState().breakoutEndsAt).toBeNull();
  });

  it("toggleMeetFx flips capture/quality effects", () => {
    useMeetingStore.getState().toggleMeetFx("watermark");
    expect(useMeetingStore.getState().watermark).toBe(true);
    useMeetingStore.getState().toggleMeetFx("liveSharing");
    expect(useMeetingStore.getState().liveSharing).toBe(true);
    useMeetingStore.getState().toggleMeetFx("watermark");
    expect(useMeetingStore.getState().watermark).toBe(false);
  });

  it("toggleMeetFx flips Zoom in-meeting controls (focus/avatars/deepfake/push-to-talk)", () => {
    const fx = ["focusMode", "avatars", "deepfakeDetection", "pushToTalk"] as const;
    for (const key of fx) {
      const before = useMeetingStore.getState()[key];
      useMeetingStore.getState().toggleMeetFx(key);
      expect(useMeetingStore.getState()[key]).toBe(!before);
    }
  });

  it("toggleMeetFx flips Webex fx (gesture/immersive-share/music-mode/AI-framing/name-labels)", () => {
    const fx = ["gestureRecognition", "immersiveShare", "musicMode", "aiFraming", "nameLabels"] as const;
    for (const key of fx) {
      const before = useMeetingStore.getState()[key];
      useMeetingStore.getState().toggleMeetFx(key);
      expect(useMeetingStore.getState()[key]).toBe(!before);
    }
  });
});

describe("meeting chapters util (Webex AI parity)", () => {
  it("segments the transcript into chapters of N lines", () => {
    const lines = Array.from({ length: 9 }, (_, i) => ({ speaker: "S", text: `Line ${i}` }));
    const chapters = meetingChapters(lines, 4);
    expect(chapters).toHaveLength(3); // 4 + 4 + 1
    expect(chapters[0]).toMatchObject({ index: 0, title: "Line 0", lineCount: 4 });
    expect(chapters[2].lineCount).toBe(1);
    expect(meetingChapters([])).toEqual([]);
  });
});

describe("meet parity++ util", () => {
  it("watermarkLabel formats viewer · meeting · timestamp", () => {
    expect(watermarkLabel("Ada", "mtg_1", 125)).toBe("Ada · mtg_1 · 2:05");
  });

  it("searchArchive filters by title/summary", () => {
    expect(searchArchive(MEETING_ARCHIVE, "acme").map((a) => a.id)).toEqual(["arc2"]);
    expect(searchArchive(MEETING_ARCHIVE, "dark-mode").map((a) => a.id)).toEqual(["arc3"]);
    expect(searchArchive(MEETING_ARCHIVE, "")).toHaveLength(MEETING_ARCHIVE.length);
  });
});

describe("MeetParityPanel", () => {
  it("renders the companion + noise controls", () => {
    render(<MeetParityPanel />);
    expect(screen.getByText("Companion mode")).toBeInTheDocument();
    expect(screen.getByText("Noise cancellation")).toBeInTheDocument();
  });
});

describe("facilitator agent util (Teams parity)", () => {
  const agenda = buildAgenda([
    { title: "Intro", minutes: 5 },
    { title: "Demo", minutes: 15 },
    { title: "Q&A", minutes: 10 },
  ]);

  it("buildAgenda lays a cumulative timeline; agendaTotal sums minutes", () => {
    expect(agenda[0]).toMatchObject({ startMin: 0, endMin: 5 });
    expect(agenda[1]).toMatchObject({ startMin: 5, endMin: 20 });
    expect(agenda[2]).toMatchObject({ startMin: 20, endMin: 30 });
    expect(agendaTotal([{ title: "a", minutes: 5 }, { title: "b", minutes: 15 }, { title: "c", minutes: 10 }])).toBe(30);
  });

  it("agendaProgress tracks the current item and overrun", () => {
    expect(agendaProgress(agenda, 0)).toMatchObject({ index: 0, done: false });
    expect(agendaProgress(agenda, 10).current?.title).toBe("Demo");
    const done = agendaProgress(agenda, 35);
    expect(done.done).toBe(true);
    expect(done.overrunMin).toBe(5);
  });

  it("extractActionItems mines commitments and assigns the speaker", () => {
    const items = extractActionItems([
      { speaker: "Ada", text: "I'll send the deck tomorrow" },
      { speaker: "Bo", text: "Nice work everyone" },
      { speaker: "Cy", text: "Action item: update the roadmap" },
    ]);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ owner: "Ada" });
    expect(items[1].owner).toBe("Cy");
  });
});

describe("FacilitatorPanel", () => {
  it("renders the agenda timekeeper", () => {
    render(<FacilitatorPanel />);
    expect(screen.getByText("Facilitator")).toBeInTheDocument();
    expect(screen.getByText("Intro & goals")).toBeInTheDocument();
  });
});
