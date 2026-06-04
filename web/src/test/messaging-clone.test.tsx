import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@/i18n";
import i18n from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { deliveryNext, canEditWithin, groupAlbums, voiceWaveform, highlightHit, communityChannels, priorityRank, urgentRepeatSchedule, rewriteMessage } from "@/features/messaging/chat";
import { useMessagingStore } from "@/features/messaging/store";
import { useStoriesStore, unseenFor } from "@/features/messaging/storiesStore";
import { useCommunitiesStore } from "@/features/messaging/communitiesStore";
import { StoriesBar } from "@/features/messaging/components/StoriesBar";
import { CommunitiesBar } from "@/features/messaging/components/CommunitiesBar";
import type { Channel, Message } from "@/features/messaging/types";

const img = (id: string, authorId: string, tMinutes: number): Message => ({
  id,
  channelId: "c",
  topicId: "t",
  parentId: null,
  authorId,
  body: "",
  tMinutes,
  reactions: [],
  kind: "file",
  file: { name: `${id}.png`, fileType: "image/png", sizeKb: 100, isImage: true },
});
const text = (id: string, authorId: string, tMinutes: number): Message => ({
  id,
  channelId: "c",
  topicId: "t",
  parentId: null,
  authorId,
  body: "hi",
  tMinutes,
  reactions: [],
  kind: "text",
});

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});

beforeEach(() => {
  useStoriesStore.getState().reset();
});

describe("messaging chat util", () => {
  it("deliveryNext advances the tick state machine", () => {
    expect(deliveryNext("sending")).toBe("sent");
    expect(deliveryNext("sent")).toBe("delivered");
    expect(deliveryNext("delivered")).toBe("read");
    expect(deliveryNext("read")).toBe("read");
  });

  it("canEditWithin respects the 15-minute window", () => {
    expect(canEditWithin(10, 20)).toBe(true); // 10 min old
    expect(canEditWithin(0, 20)).toBe(false); // 20 min old
    expect(canEditWithin(20, 10)).toBe(false); // future guard
  });

  it("groupAlbums clusters consecutive same-author media", () => {
    const groups = groupAlbums([img("a", "u1", 1), img("b", "u1", 2), text("c", "u1", 3)]);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveLength(2);
    expect(groups[1]).toHaveLength(1);
    expect(groupAlbums([img("a", "u1", 1), img("b", "u2", 2)])).toHaveLength(2); // different author
  });

  it("voiceWaveform is deterministic and bounded", () => {
    const w = voiceWaveform("msg_1", 24);
    expect(w).toHaveLength(24);
    expect(w.every((n) => n >= 0.15 && n <= 1)).toBe(true);
    expect(voiceWaveform("msg_1")).toEqual(voiceWaveform("msg_1"));
  });

  it("highlightHit matches keywords case-insensitively", () => {
    expect(highlightHit("Deploy is green", ["deploy", "urgent"])).toBe(true);
    expect(highlightHit("all good", ["urgent"])).toBe(false);
    expect(highlightHit("anything", ["   "])).toBe(false);
  });

  it("priorityRank orders urgent > important > normal", () => {
    expect(priorityRank("urgent")).toBe(2);
    expect(priorityRank("important")).toBe(1);
    expect(priorityRank("normal")).toBe(0);
    expect(priorityRank(undefined)).toBe(0);
  });

  it("urgentRepeatSchedule pings every 2 min for 20 min until read", () => {
    expect(urgentRepeatSchedule(0, 0)).toMatchObject({ active: true, repeats: 0, nextInMin: 2 });
    expect(urgentRepeatSchedule(0, 5)).toMatchObject({ active: true, repeats: 2, nextInMin: 1 });
    expect(urgentRepeatSchedule(0, 25).active).toBe(false); // window closed
    expect(urgentRepeatSchedule(0, 25).nextInMin).toBeNull();
    expect(urgentRepeatSchedule(0, 4, true).active).toBe(false); // read → stop
  });

  it("rewriteMessage applies Copilot-style tone transforms", () => {
    expect(rewriteMessage("we should just really ship it", "concise")).toBe("we should ship it");
    expect(rewriteMessage("ship it", "professional")).toBe("Ship it.");
    expect(rewriteMessage("ship it", "friendly")).toBe("Ship it!");
    expect(rewriteMessage("  ", "concise")).toBe("");
  });
});

describe("messaging store — wired orphans (G1)", () => {
  it("setMessagePriority marks a message urgent", () => {
    const id = useMessagingStore.getState().messages[0].id;
    useMessagingStore.getState().setMessagePriority(id, "urgent");
    expect(useMessagingStore.getState().messages.find((m) => m.id === id)!.priority).toBe("urgent");
    useMessagingStore.getState().setMessagePriority(id, "normal");
  });

  it("toggleSavedOnly flips the saved-only filter", () => {
    const before = useMessagingStore.getState().savedOnly;
    useMessagingStore.getState().toggleSavedOnly();
    expect(useMessagingStore.getState().savedOnly).toBe(!before);
    useMessagingStore.getState().toggleSavedOnly();
    expect(useMessagingStore.getState().savedOnly).toBe(before);
  });

  it("createChannel creates a shared (cross-org) channel", () => {
    const before = useMessagingStore.getState().channels.length;
    useMessagingStore.getState().createChannel("partners", "shared");
    const chs = useMessagingStore.getState().channels;
    expect(chs.length).toBe(before + 1);
    expect(chs.some((c) => c.kind === "shared")).toBe(true);
  });
});

describe("storiesStore", () => {
  it("seeds, adds and marks seen", () => {
    expect(useStoriesStore.getState().stories.length).toBe(3);
    useStoriesStore.getState().addStory("usr_1", "My status");
    expect(useStoriesStore.getState().stories.length).toBe(4);
    const id = useStoriesStore.getState().stories[0].id;
    useStoriesStore.getState().markSeen(id, "usr_9");
    expect(useStoriesStore.getState().stories.find((s) => s.id === id)!.seenBy).toContain("usr_9");
  });

  it("unseenFor excludes own + already-seen stories", () => {
    const stories = useStoriesStore.getState().stories;
    expect(unseenFor(stories, "usr_9")).toHaveLength(3);
    expect(unseenFor(stories, "usr_1")).toHaveLength(2); // st2 already seen by usr_1
  });
});

describe("StoriesBar", () => {
  it("renders the add-status control", () => {
    render(<StoriesBar />);
    expect(screen.getByText("Add status")).toBeInTheDocument();
  });
});

const chan = (id: string, name: string): Channel => ({ id, kind: "channel", name });

describe("communities (group-of-groups)", () => {
  it("communityChannels resolves members and skips missing", () => {
    const community = { id: "c", name: "Eng", channelIds: ["ch_eng", "ch_missing", "ch_product"] };
    const channels = [chan("ch_eng", "engineering"), chan("ch_product", "product"), chan("ch_other", "other")];
    expect(communityChannels(community, channels).map((c) => c.id)).toEqual(["ch_eng", "ch_product"]);
  });

  it("communitiesStore selects and resets the active community", () => {
    useCommunitiesStore.getState().setActiveCommunity("cm_eng");
    expect(useCommunitiesStore.getState().activeCommunityId).toBe("cm_eng");
    useCommunitiesStore.getState().reset();
    expect(useCommunitiesStore.getState().activeCommunityId).toBeNull();
  });

  it("CommunitiesBar renders the community rail", () => {
    render(<CommunitiesBar />);
    expect(screen.getByRole("button", { name: "Engineering" })).toBeInTheDocument();
  });
});
