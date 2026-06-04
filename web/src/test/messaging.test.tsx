import { describe, it, expect, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import i18n from "@/i18n";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { useMessagingStore } from "@/features/messaging/store";
import { MessagingPage } from "@/features/messaging/MessagingPage";
import { MessageList } from "@/features/messaging/components/MessageList";

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});

describe("Messaging store — optimistic send & reactions", () => {
  it("send() appends an optimistic message to the active topic", () => {
    const { activeTopicId } = useMessagingStore.getState();
    const before = useMessagingStore.getState().messages.length;
    useMessagingStore.getState().send("hello team", "usr_1");
    const msgs = useMessagingStore.getState().messages;
    expect(msgs.length).toBe(before + 1);
    const last = msgs[msgs.length - 1];
    expect(last.body).toBe("hello team");
    expect(last.status).toBe("sending");
    expect(last.topicId).toBe(activeTopicId);
  });

  it("toggleReaction adds then removes the current user", () => {
    useMessagingStore.getState().toggleReaction("m2", "🔥", "usr_1");
    let m2 = useMessagingStore.getState().messages.find((m) => m.id === "m2")!;
    expect(m2.reactions.find((r) => r.emoji === "🔥")?.userIds).toContain("usr_1");
    useMessagingStore.getState().toggleReaction("m2", "🔥", "usr_1");
    m2 = useMessagingStore.getState().messages.find((m) => m.id === "m2")!;
    expect(m2.reactions.find((r) => r.emoji === "🔥")).toBeUndefined();
  });

  it("reply() threads a message under its parent", () => {
    useMessagingStore.getState().reply("m6", "agreed", "usr_1");
    const replies = useMessagingStore.getState().messages.filter((m) => m.parentId === "m6");
    expect(replies.some((r) => r.body === "agreed")).toBe(true);
  });
});

describe("Messaging — competitor-grade actions", () => {
  it("edit marks the message edited (Teams/Telegram)", () => {
    useMessagingStore.getState().editMessage("m5", "Q4 themes updated");
    const m = useMessagingStore.getState().messages.find((x) => x.id === "m5")!;
    expect(m.body).toBe("Q4 themes updated");
    expect(m.edited).toBe(true);
  });

  it("pin (Slack/Telegram) and save (Slack) toggle flags", () => {
    useMessagingStore.getState().togglePin("m2");
    expect(useMessagingStore.getState().messages.find((x) => x.id === "m2")!.pinned).toBe(true);
    useMessagingStore.getState().toggleSave("m2");
    expect(useMessagingStore.getState().messages.find((x) => x.id === "m2")!.saved).toBe(true);
  });

  it("delete-for-everyone tombstones a message (Telegram/WhatsApp)", () => {
    useMessagingStore.getState().deleteForEveryone("m8");
    const m = useMessagingStore.getState().messages.find((x) => x.id === "m8")!;
    expect(m.deleted).toBe(true);
    expect(m.body).toBe("");
  });

  it("forward copies a message into the target channel (Telegram/WhatsApp)", () => {
    const before = useMessagingStore
      .getState()
      .messages.filter((x) => x.channelId === "ch_design").length;
    useMessagingStore.getState().forward("m6", "ch_design");
    const after = useMessagingStore
      .getState()
      .messages.filter((x) => x.channelId === "ch_design");
    expect(after.length).toBe(before + 1);
    expect(after.some((x) => x.forwardedFrom)).toBe(true);
  });

  it("internal note (Chatwoot) and voice message (WhatsApp) kinds", () => {
    useMessagingStore.getState().sendNote("call back today", "usr_1");
    useMessagingStore.getState().sendVoice(9, "usr_1");
    const msgs = useMessagingStore.getState().messages;
    expect(msgs.some((x) => x.kind === "note" && x.body === "call back today")).toBe(true);
    expect(msgs.some((x) => x.kind === "voice" && x.voiceSec === 9)).toBe(true);
  });
});

describe("Messaging — native clones (WA/Telegram/Slack/Chatwoot)", () => {
  it("delete-for-me hides a message locally; restoreForMe undoes it", () => {
    useMessagingStore.getState().deleteForMe("m5");
    expect(useMessagingStore.getState().messages.find((x) => x.id === "m5")!.hiddenForMe).toBe(true);
    useMessagingStore.getState().restoreForMe("m5");
    expect(useMessagingStore.getState().messages.find((x) => x.id === "m5")!.hiddenForMe).toBe(false);
  });

  it("pin/mute a chat (Telegram/WhatsApp)", () => {
    useMessagingStore.getState().togglePinChat("ch_eng");
    useMessagingStore.getState().toggleMuteChat("ch_eng");
    const c = useMessagingStore.getState().channels.find((x) => x.id === "ch_eng")!;
    expect(c.pinned).toBe(true);
    expect(c.muted).toBe(true);
  });

  it("conversation status update (Chatwoot)", () => {
    useMessagingStore.getState().setStatus("dm_jordan", "resolved");
    expect(useMessagingStore.getState().channels.find((x) => x.id === "dm_jordan")!.status).toBe("resolved");
  });

  it("folder filter is settable", () => {
    useMessagingStore.getState().setFolder("dms");
    expect(useMessagingStore.getState().folder).toBe("dms");
    useMessagingStore.getState().setFolder("all");
  });

  it("postExternal writes into a specific channel/topic (meeting↔chat bridge)", () => {
    const before = useMessagingStore.getState().messages.filter((m) => m.topicId === "tp_dm_marco").length;
    useMessagingStore.getState().postExternal("dm_marco", "tp_dm_marco", "bridged hello", "usr_1");
    const after = useMessagingStore.getState().messages.filter((m) => m.topicId === "tp_dm_marco");
    expect(after.length).toBe(before + 1);
    expect(after.some((m) => m.body === "bridged hello")).toBe(true);
  });
});

describe("Faz 2 — new features (polls / disappearing / priority / csat)", () => {
  it("createPoll + vote + closePoll", () => {
    const before = useMessagingStore.getState().messages.filter((m) => m.kind === "poll").length;
    useMessagingStore.getState().createPoll("Lunch?", ["Pizza", "Salad"], {}, "usr_1");
    const polls = useMessagingStore.getState().messages.filter((m) => m.kind === "poll");
    expect(polls.length).toBe(before + 1);
    const poll = polls[polls.length - 1];
    useMessagingStore.getState().vote(poll.id, "o0", "usr_2");
    let m = useMessagingStore.getState().messages.find((x) => x.id === poll.id)!;
    expect(m.poll!.options.find((o) => o.id === "o0")!.votes).toContain("usr_2");
    useMessagingStore.getState().closePoll(poll.id);
    m = useMessagingStore.getState().messages.find((x) => x.id === poll.id)!;
    expect(m.poll!.closed).toBe(true);
  });

  it("single-choice vote moves the vote between options", () => {
    useMessagingStore.getState().createPoll("Pick", ["A", "B"], {}, "usr_1");
    const poll = useMessagingStore.getState().messages.filter((m) => m.kind === "poll").slice(-1)[0];
    useMessagingStore.getState().vote(poll.id, "o0", "usr_1");
    useMessagingStore.getState().vote(poll.id, "o1", "usr_1");
    const m = useMessagingStore.getState().messages.find((x) => x.id === poll.id)!;
    expect(m.poll!.options.find((o) => o.id === "o0")!.votes).not.toContain("usr_1");
    expect(m.poll!.options.find((o) => o.id === "o1")!.votes).toContain("usr_1");
  });

  it("disappearing chat marks new messages ephemeral (WhatsApp/Telegram)", () => {
    useMessagingStore.getState().setDisappearing("ch_product", "24h");
    useMessagingStore.getState().send("vanishing", "usr_1");
    const msgs = useMessagingStore.getState().messages;
    expect(msgs[msgs.length - 1].ephemeral).toBe(true);
    useMessagingStore.getState().setDisappearing("ch_product", "off");
  });

  it("mark-unread, priority and CSAT (Telegram/Chatwoot)", () => {
    useMessagingStore.getState().toggleMarkUnread("ch_eng");
    expect(useMessagingStore.getState().channels.find((c) => c.id === "ch_eng")!.unreadManual).toBe(true);
    useMessagingStore.getState().setPriority("dm_jordan", "urgent");
    expect(useMessagingStore.getState().channels.find((c) => c.id === "dm_jordan")!.priority).toBe("urgent");
    useMessagingStore.getState().submitCsat("dm_jordan", 5);
    const j = useMessagingStore.getState().channels.find((c) => c.id === "dm_jordan")!;
    expect(j.csat).toBe(5);
    expect(j.status).toBe("resolved");
  });
});

describe("Faz 2 — files, channels & DMs", () => {
  it("createChannel adds a channel + topic and selects it", () => {
    const c0 = useMessagingStore.getState().channels.length;
    useMessagingStore.getState().createChannel("marketing", "channel");
    const s = useMessagingStore.getState();
    expect(s.channels.length).toBe(c0 + 1);
    const ch = s.channels[s.channels.length - 1];
    expect(s.activeChannelId).toBe(ch.id);
    expect(s.topics.some((tp) => tp.channelId === ch.id)).toBe(true);
  });

  it("createDm names a 1:1 and a group", () => {
    useMessagingStore.getState().createDm(["usr_2"]);
    expect(useMessagingStore.getState().channels.slice(-1)[0].name).toBe("Defne Yıldız");
    useMessagingStore.getState().createDm(["usr_2", "usr_3"]);
    expect(useMessagingStore.getState().channels.slice(-1)[0].name).toContain(",");
  });

  it("sendFile and sendSticker append typed messages", () => {
    useMessagingStore.getState().setChannel("ch_product");
    useMessagingStore.getState().sendFile({ name: "a.pdf", fileType: "pdf", sizeKb: 10 }, "usr_1");
    useMessagingStore.getState().sendSticker("🎉", "usr_1");
    const msgs = useMessagingStore.getState().messages;
    expect(msgs.some((m) => m.kind === "file" && m.file?.name === "a.pdf")).toBe(true);
    expect(msgs.some((m) => m.kind === "sticker" && m.sticker === "🎉")).toBe(true);
  });

  it("archiveChannel toggles archived", () => {
    useMessagingStore.getState().archiveChannel("ch_design");
    expect(useMessagingStore.getState().channels.find((c) => c.id === "ch_design")!.archived).toBe(true);
  });
});

describe("MessagingPage — renders channels and messages", () => {
  it("shows a channel and a seeded message", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MessagingPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getAllByText("product").length).toBeGreaterThan(0);
    // Appears both in the message list and the pinned bar.
    expect(screen.getAllByText(/Launch readiness check/).length).toBeGreaterThan(0);
  });
});

describe("MessageList — EmptyState standard (P1-E)", () => {
  it("renders the no-results EmptyState (icon + title + hint) when search matches nothing", () => {
    useMessagingStore.getState().setSearch("zzz-nonexistent-query-xyz");
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MessageList />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText("No messages match your search.")).toBeTruthy();
    expect(screen.getByText("Try a different keyword or clear the search.")).toBeTruthy();
    useMessagingStore.getState().setSearch("");
  });
});

describe("ChannelHeader — mobile search overlay (P1-F)", () => {
  it("toggle button reveals a full-width search input", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MessagingPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const before = screen.getAllByLabelText("Search messages").length;
    const toggle = screen.getByRole("button", { name: "Search messages" });
    fireEvent.click(toggle);
    expect(screen.getAllByLabelText("Search messages").length).toBe(before + 1);
  });
});
