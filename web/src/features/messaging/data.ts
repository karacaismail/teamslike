import type { Channel, Message, Topic } from "./types";

/**
 * Dummy seed. Channels/DMs are NATIVE conversations — we clone the chat
 * capabilities of Slack/Teams/WhatsApp/Telegram/Chatwoot, not integrate them.
 */
export const CHANNELS: Channel[] = [
  // Channels are workspace-scoped (J5); DMs stay cross-workspace (untagged).
  { id: "ch_product", kind: "channel", name: "product", unread: 3, pinned: true, workspaceId: "ws_core" },
  { id: "ch_eng", kind: "channel", name: "engineering", unread: 1, workspaceId: "ws_core" },
  { id: "ch_design", kind: "private", name: "design-private", workspaceId: "ws_core" },
  { id: "ch_announce", kind: "broadcast", name: "announcements", subscribers: 1240, muted: true, workspaceId: "ws_core" },
  { id: "ch_growth", kind: "channel", name: "growth-team", unread: 2, workspaceId: "ws_growth" },
  { id: "dm_defne", kind: "dm", name: "Defne Yıldız", dmUserId: "usr_2", unread: 1, e2ee: true },
  { id: "dm_marco", kind: "dm", name: "Marco Rossi", dmUserId: "usr_3", e2ee: true },
  { id: "dm_priya", kind: "dm", name: "Priya N.", e2ee: true },
  // Chatwoot-style customer conversation (status/label/assignee/notes cloned)
  {
    id: "dm_jordan",
    kind: "dm",
    name: "Jordan Blake",
    isCustomer: true,
    status: "open",
    label: "billing",
    assigneeId: "usr_1",
    priority: "high",
    unread: 2,
  },
];

export const TOPICS: Topic[] = [
  { id: "tp_growth", channelId: "ch_growth", title: "Q3 experiments" },
  { id: "tp_q3", channelId: "ch_product", title: "Q3 launch" },
  { id: "tp_road", channelId: "ch_product", title: "Roadmap" },
  { id: "tp_rfc", channelId: "ch_eng", title: "RFC: realtime layer" },
  { id: "tp_ci", channelId: "ch_eng", title: "CI pipeline" },
  { id: "tp_ds", channelId: "ch_design", title: "Design system" },
  { id: "tp_announce", channelId: "ch_announce", title: "main" },
  { id: "tp_dm_defne", channelId: "dm_defne", title: "main" },
  { id: "tp_dm_marco", channelId: "dm_marco", title: "main" },
  { id: "tp_dm_priya", channelId: "dm_priya", title: "main" },
  { id: "tp_dm_jordan", channelId: "dm_jordan", title: "main" },
];

export const MESSAGES: Message[] = [
  // #product / Q3 launch
  {
    id: "m1",
    channelId: "ch_product",
    topicId: "tp_q3",
    parentId: null,
    authorId: "usr_2",
    body: "Launch readiness check — copy is final, pricing page pending. @Ismail can you confirm the **15:00 go/no-go**?",
    bodyAlt: "Lansman hazırlık kontrolü — metin son hâlinde, fiyat sayfası bekliyor. @Ismail 15:00 go/no-go'yu onaylar mısın?",
    tMinutes: 95,
    pinned: true,
    important: true,
    reactions: [{ emoji: "👍", userIds: ["usr_3", "usr_4"] }],
  },
  { id: "r1", channelId: "ch_product", topicId: "tp_q3", parentId: "m1", authorId: "usr_3", body: "Pricing page will be ready by 14:00.", tMinutes: 60, reactions: [] },
  { id: "r2", channelId: "ch_product", topicId: "tp_q3", parentId: "m1", authorId: "usr_2", body: "Perfect, thanks.", tMinutes: 55, reactions: [] },
  { id: "m2", channelId: "ch_product", topicId: "tp_q3", parentId: null, authorId: "usr_3", body: "Backend is green, load test passed at 12k concurrent.", tMinutes: 70, reactions: [{ emoji: "🎉", userIds: ["usr_2"] }] },
  { id: "m4", channelId: "ch_product", topicId: "tp_q3", parentId: null, authorId: "usr_4", body: "Nice — I'll mirror that on the public status page.", tMinutes: 52, replyToId: "m2", reactions: [] },
  { id: "m3", channelId: "ch_product", topicId: "tp_q3", parentId: null, authorId: "usr_4", body: "Updated the hero illustration and dark-mode tokens.", tMinutes: 40, edited: true, reactions: [] },
  { id: "mf1", channelId: "ch_product", topicId: "tp_q3", parentId: null, authorId: "usr_3", body: "launch-plan.pdf", tMinutes: 48, kind: "file", file: { name: "launch-plan.pdf", fileType: "pdf", sizeKb: 248 }, reactions: [] },
  {
    id: "mp1",
    channelId: "ch_product",
    topicId: "tp_q3",
    parentId: null,
    authorId: "usr_2",
    body: "",
    tMinutes: 34,
    kind: "poll",
    reactions: [],
    poll: {
      id: "poll1",
      question: "When should we run the go/no-go?",
      options: [
        { id: "o0", text: "14:30", votes: ["usr_3"] },
        { id: "o1", text: "15:00", votes: ["usr_1", "usr_4"] },
        { id: "o2", text: "Tomorrow AM", votes: [] },
      ],
      anonymous: false,
    },
  },
  { id: "mv1", channelId: "ch_product", topicId: "tp_q3", parentId: null, authorId: "usr_2", body: "", tMinutes: 30, kind: "voice", voiceSec: 14, reactions: [] },
  { id: "sm1", channelId: "ch_product", topicId: "tp_q3", parentId: null, authorId: "usr_1", body: "Reminder: go/no-go decision in 10 minutes.", tMinutes: 0, scheduled: true, reactions: [] },
  // #product / Roadmap
  { id: "m5", channelId: "ch_product", topicId: "tp_road", parentId: null, authorId: "usr_2", body: "Q4 themes draft is in Docs.", tMinutes: 200, reactions: [] },
  // #engineering / RFC
  { id: "m6", channelId: "ch_eng", topicId: "tp_rfc", parentId: null, authorId: "usr_3", body: "RFC: move realtime to a single WS provider with SSE fallback. Thoughts?", tMinutes: 180, reactions: [{ emoji: "👀", userIds: ["usr_1"] }] },
  { id: "m7", channelId: "ch_eng", topicId: "tp_rfc", parentId: null, authorId: "usr_4", body: "+1, simplifies reconnection logic. See `RealtimeProvider`.", tMinutes: 150, reactions: [] },
  {
    id: "m13",
    channelId: "ch_eng",
    topicId: "tp_rfc",
    parentId: null,
    authorId: "usr_3",
    body: "Plan:\n- single WS provider\n- SSE fallback\n- central backoff\nDoc: [RFC draft](https://example.com/rfc)",
    tMinutes: 140,
    reactions: [],
  },
  // #engineering / CI
  { id: "m8", channelId: "ch_eng", topicId: "tp_ci", parentId: null, authorId: "usr_5", body: "CI flaky on visual snapshots; investigating.", tMinutes: 300, reactions: [] },
  // design-private
  { id: "m9", channelId: "ch_design", topicId: "tp_ds", parentId: null, authorId: "usr_4", body: "Button radius token bumped to `0.5rem` — propagates to all components.", tMinutes: 90, reactions: [{ emoji: "✅", userIds: ["usr_1", "usr_4"] }] },
  { id: "mi1", channelId: "ch_design", topicId: "tp_ds", parentId: null, authorId: "usr_4", body: "hero.png", tMinutes: 85, kind: "file", file: { name: "hero.png", fileType: "png", sizeKb: 1240, isImage: true }, reactions: [] },
  // announcements (broadcast)
  { id: "ma1", channelId: "ch_announce", topicId: "tp_announce", parentId: null, authorId: "usr_1", body: "AURA 1.0 ships next week. This is a read-only broadcast channel.", tMinutes: 240, viewCount: 1240, reactions: [{ emoji: "🎉", userIds: ["usr_2", "usr_3", "usr_4"] }] },
  // DMs (WhatsApp/Telegram-style bubbles)
  { id: "m10", channelId: "dm_defne", topicId: "tp_dm_defne", parentId: null, authorId: "usr_2", body: "Can you review the launch thread before the call?", tMinutes: 20, reactions: [] },
  { id: "m12", channelId: "dm_marco", topicId: "tp_dm_marco", parentId: null, authorId: "usr_3", body: "Sent the RFC link.", tMinutes: 130, reactions: [] },
  { id: "p1", channelId: "dm_priya", topicId: "tp_dm_priya", parentId: null, authorId: "ext_priya", authorName: "Priya N.", body: "Did you see the RFC?", tMinutes: 26, reactions: [] },
  { id: "p2", channelId: "dm_priya", topicId: "tp_dm_priya", parentId: null, authorId: "usr_1", body: "Reviewing now.", tMinutes: 24, status: "delivered", replyToId: "p1", reactions: [] },
  { id: "pv", channelId: "dm_priya", topicId: "tp_dm_priya", parentId: null, authorId: "ext_priya", authorName: "Priya N.", body: "", tMinutes: 18, kind: "voice", voiceSec: 9, reactions: [] },
  { id: "p3", channelId: "dm_priya", topicId: "tp_dm_priya", parentId: null, authorId: "usr_1", body: "**Looks solid.** I'll comment inline.", tMinutes: 12, status: "read", reactions: [] },
  // Chatwoot-style customer conversation
  { id: "syscj", channelId: "dm_jordan", topicId: "tp_dm_jordan", parentId: null, authorId: "system", body: "", tMinutes: 33, kind: "system", systemKey: "e2ee", reactions: [] },
  { id: "cj1", channelId: "dm_jordan", topicId: "tp_dm_jordan", parentId: null, authorId: "ext_jordan", authorName: "Jordan Blake", body: "Hi! Is the Pro plan billed monthly or annually?", tMinutes: 25, reactions: [] },
  { id: "cj2", channelId: "dm_jordan", topicId: "tp_dm_jordan", parentId: null, authorId: "usr_1", body: "Hi Jordan — both, and annual saves 20%.", tMinutes: 22, status: "read", reactions: [] },
  { id: "cjn", channelId: "dm_jordan", topicId: "tp_dm_jordan", parentId: null, authorId: "usr_1", body: "Lead came from the pricing page — high intent, follow up today.", tMinutes: 20, kind: "note", reactions: [] },
];

/** Where the "New messages" divider sits per topic (Slack/Teams). */
export const UNREAD_FROM: Record<string, string> = {
  tp_rfc: "m13",
  tp_dm_jordan: "cj1",
};

export const CANNED: { title: string; body: string }[] = [
  { title: "Greeting", body: "Hi! Thanks for reaching out — how can I help today?" },
  { title: "Pricing", body: "Our Pro plan is **$15/seat**; annual billing saves 20%." },
  { title: "Follow-up", body: "Just following up — let me know if you have any questions." },
];
