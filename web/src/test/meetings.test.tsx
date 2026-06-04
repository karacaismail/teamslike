import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import i18n from "@/i18n";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { useMeetingStore } from "@/features/meetings/store";
import {
  togglePinList,
  MAX_PINS,
  accessTierDecision,
  effectiveCanUnmute,
  effectiveCanCam,
  resolutionProfile,
  buildMeetingNotes,
} from "@/features/meetings/meetGm";
import { resolveAgentPlan } from "@/data/agentScenarios";
import { MeetingsPage } from "@/features/meetings/MeetingsPage";
import { MeetGmPanel } from "@/features/meetings/components/MeetGmPanel";

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});

describe("Meetings store", () => {
  it("join populates the room; self media mirrors local toggles", () => {
    useMeetingStore.getState().openPrejoin("mtg_standup");
    useMeetingStore.getState().join();
    const s = useMeetingStore.getState();
    expect(s.phase).toBe("in");
    expect(s.participants.length).toBe(5);
    const before = s.micOn;
    useMeetingStore.getState().toggleMic();
    const self = useMeetingStore.getState().participants.find((p) => p.isSelf)!;
    expect(self.micOn).toBe(!before);
  });

  it("admit moves a lobby entry into participants", () => {
    const lobby = useMeetingStore.getState().lobbyQueue[0];
    const n0 = useMeetingStore.getState().participants.length;
    useMeetingStore.getState().admit(lobby.id);
    expect(useMeetingStore.getState().participants.length).toBe(n0 + 1);
    expect(useMeetingStore.getState().lobbyQueue.find((l) => l.id === lobby.id)).toBeUndefined();
  });

  it("pushCaption appends a language-resolved caption", () => {
    useMeetingStore.getState().setCaptionLang("en");
    const c0 = useMeetingStore.getState().captions.length;
    useMeetingStore.getState().pushCaption();
    const caps = useMeetingStore.getState().captions;
    expect(caps.length).toBe(c0 + 1);
    expect(caps[caps.length - 1].text.length).toBeGreaterThan(0);
  });

  it("createBreakouts assigns all non-self participants", () => {
    useMeetingStore.getState().createBreakouts(2);
    const b = useMeetingStore.getState().breakouts;
    expect(b.length).toBe(2);
    const assigned = b.reduce((n, r) => n + r.participantIds.length, 0);
    const others = useMeetingStore.getState().participants.filter((p) => !p.isSelf).length;
    expect(assigned).toBe(others);
  });

  it("startFromChannel links the meeting to a chat (Faz 2↔3 bridge)", () => {
    useMeetingStore.getState().startFromChannel("ch_product", "tp_q3", "#product");
    const s = useMeetingStore.getState();
    expect(s.phase).toBe("prejoin");
    expect(s.linkedChannelId).toBe("ch_product");
    expect(s.linkedTopicId).toBe("tp_q3");
  });
});

describe("Meetings — moderator & rooms (Teams/Zoom/Jitsi)", () => {
  it("create + join a persistent video room", () => {
    const before = useMeetingStore.getState().rooms.length;
    useMeetingStore.getState().createRoom("QA Sync", { locked: true, waitingRoom: false });
    expect(useMeetingStore.getState().rooms.length).toBe(before + 1);
    const room = useMeetingStore.getState().rooms[0];
    useMeetingStore.getState().joinRoom(room.id);
    const s = useMeetingStore.getState();
    expect(s.phase).toBe("prejoin");
    expect(s.activeTitle).toBe("QA Sync");
    expect(s.locked).toBe(true);
  });

  it("muteAll mutes everyone except self", () => {
    useMeetingStore.getState().join();
    useMeetingStore.getState().muteAll();
    const ps = useMeetingStore.getState().participants;
    expect(ps.filter((p) => !p.isSelf).every((p) => !p.micOn)).toBe(true);
  });

  it("spotlight and lock toggle", () => {
    useMeetingStore.getState().toggleSpotlight("usr_2");
    expect(useMeetingStore.getState().spotlightId).toBe("usr_2");
    const lock0 = useMeetingStore.getState().locked;
    useMeetingStore.getState().toggleLock();
    expect(useMeetingStore.getState().locked).toBe(!lock0);
  });

  it("makeCoHost and removeParticipant", () => {
    useMeetingStore.getState().makeCoHost("usr_3");
    expect(useMeetingStore.getState().participants.find((p) => p.id === "usr_3")!.role).toBe("cohost");
    const n0 = useMeetingStore.getState().participants.length;
    useMeetingStore.getState().removeParticipant("usr_5");
    expect(useMeetingStore.getState().participants.length).toBe(n0 - 1);
  });
});

describe("Meetings — in-call engagement (Zoom/Meet/Teams/Jitsi)", () => {
  it("launch + vote + close poll", () => {
    useMeetingStore.getState().launchPoll("Lunch?", ["Pizza", "Salad"]);
    expect(useMeetingStore.getState().meetingPoll).not.toBeNull();
    useMeetingStore.getState().votePoll("mo0", "usr_2");
    expect(useMeetingStore.getState().meetingPoll!.options.find((o) => o.id === "mo0")!.votes).toContain("usr_2");
    useMeetingStore.getState().votePoll("mo1", "usr_2");
    expect(useMeetingStore.getState().meetingPoll!.options.find((o) => o.id === "mo0")!.votes).not.toContain("usr_2");
    useMeetingStore.getState().closeMeetingPoll();
    expect(useMeetingStore.getState().meetingPoll!.closed).toBe(true);
  });

  it("Q&A ask + upvote + answer", () => {
    useMeetingStore.getState().join();
    const n0 = useMeetingStore.getState().qna.length;
    useMeetingStore.getState().askQuestion("When is GA?", "usr_3");
    const qna = useMeetingStore.getState().qna;
    expect(qna.length).toBe(n0 + 1);
    const q = qna[qna.length - 1];
    useMeetingStore.getState().upvoteQuestion(q.id, "usr_1");
    expect(useMeetingStore.getState().qna.find((x) => x.id === q.id)!.upvotes).toContain("usr_1");
    useMeetingStore.getState().answerQuestion(q.id);
    expect(useMeetingStore.getState().qna.find((x) => x.id === q.id)!.answered).toBe(true);
  });

  it("toggleWhiteboard flips state", () => {
    const w0 = useMeetingStore.getState().whiteboardOpen;
    useMeetingStore.getState().toggleWhiteboard();
    expect(useMeetingStore.getState().whiteboardOpen).toBe(!w0);
  });
});

describe("Meetings AI scenario", () => {
  it("a meeting prompt routes to the meeting plan (notes + action items)", () => {
    const plan = resolveAgentPlan("Summarize this meeting and list action items", i18n.t);
    expect(plan.steps.join(" ").toLowerCase()).toContain("transcript");
    expect(plan.answer.toLowerCase()).toContain("action item");
  });
});

describe("MeetingsPage landing", () => {
  it("renders the landing with the meetings list", () => {
    useMeetingStore.getState().leave();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MeetingsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText("Daily Standup")).toBeInTheDocument();
    expect(screen.getByText("New meeting")).toBeInTheDocument();
    expect(screen.getByText("Your personal room")).toBeInTheDocument();
  });
});

describe("Google Meet parity (GM) — pure util", () => {
  it("togglePinList caps at MAX_PINS", () => {
    let pins: string[] = [];
    for (let i = 0; i < MAX_PINS + 2; i++) pins = togglePinList(pins, `p${i}`);
    expect(pins.length).toBe(MAX_PINS);
    pins = togglePinList(pins, "p0"); // remove existing
    expect(pins).not.toContain("p0");
  });

  it("accessTierDecision gates by tier", () => {
    expect(accessTierDecision("open", { invited: false, trustedDomain: false })).toBe("admit");
    expect(accessTierDecision("trusted", { invited: false, trustedDomain: true })).toBe("admit");
    expect(accessTierDecision("trusted", { invited: false, trustedDomain: false })).toBe("knock");
    expect(accessTierDecision("restricted", { invited: false, trustedDomain: true })).toBe("deny");
    expect(accessTierDecision("restricted", { invited: true, trustedDomain: false })).toBe("admit");
  });

  it("locks + viewer gate self media; resolutionProfile maps bitrate", () => {
    expect(effectiveCanUnmute(true, "host")).toBe(true);
    expect(effectiveCanUnmute(true, "attendee")).toBe(false);
    expect(effectiveCanUnmute(false, "viewer")).toBe(false);
    expect(effectiveCanCam(true, "attendee")).toBe(false);
    expect(resolutionProfile("fhd").kbps).toBe(3200);
    expect(resolutionProfile("audio").kbps).toBe(0);
  });

  it("buildMeetingNotes splits decisions and next steps", () => {
    const notes = buildMeetingNotes([
      { id: "c1", speaker: "A", text: "We decided to go with plan A." },
      { id: "c2", speaker: "B", text: "Next, ship the beta." },
      { id: "c3", speaker: "A", text: "Nice work everyone." },
    ]);
    expect(notes.summary.length).toBeGreaterThan(0);
    expect(notes.decisions.length).toBe(1);
    expect(notes.nextSteps.length).toBe(1);
  });
});

describe("Google Meet parity (GM) — store", () => {
  it("granular locks, access tier, viewer, eject-to-waiting", () => {
    useMeetingStore.getState().openPrejoin("mtg_standup");
    useMeetingStore.getState().join();

    const audio0 = useMeetingStore.getState().audioLock;
    useMeetingStore.getState().toggleAudioLock();
    expect(useMeetingStore.getState().audioLock).toBe(!audio0);

    useMeetingStore.getState().setAccessTier("restricted");
    expect(useMeetingStore.getState().accessTier).toBe("restricted");

    useMeetingStore.getState().makeViewer("usr_2");
    expect(useMeetingStore.getState().participants.find((p) => p.id === "usr_2")!.role).toBe("viewer");

    const n0 = useMeetingStore.getState().participants.length;
    const q0 = useMeetingStore.getState().lobbyQueue.length;
    useMeetingStore.getState().sendToWaitingRoom("usr_4");
    expect(useMeetingStore.getState().participants.length).toBe(n0 - 1);
    expect(useMeetingStore.getState().lobbyQueue.length).toBe(q0 + 1);
  });

  it("multi-pin, remote control, notes, speech translation, quality", () => {
    useMeetingStore.getState().togglePin("usr_2");
    expect(useMeetingStore.getState().pinnedIds).toContain("usr_2");

    useMeetingStore.getState().requestRemoteControl("usr_3");
    useMeetingStore.getState().grantRemoteControl("usr_2");
    expect(useMeetingStore.getState().remoteControl).toEqual({ presenterId: "usr_3", controllerId: "usr_2" });
    useMeetingStore.getState().stopRemoteControl();
    expect(useMeetingStore.getState().remoteControl).toBeNull();

    useMeetingStore.getState().generateNotes();
    expect(useMeetingStore.getState().meetingNotes).not.toBeNull();

    useMeetingStore.getState().toggleSpeechTranslation();
    expect(useMeetingStore.getState().speechTranslation).toBe(true);
    useMeetingStore.getState().setSendResolution("hd");
    expect(useMeetingStore.getState().sendResolution).toBe("hd");
  });

  it("MeetGmPanel renders the advanced moderation controls", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MeetGmPanel />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText("Advanced moderation")).toBeInTheDocument();
    expect(screen.getByText("Take notes for me")).toBeInTheDocument();
  });
});
