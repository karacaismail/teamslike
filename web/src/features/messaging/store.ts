import { create } from "zustand";
import { CHANNELS, MESSAGES, TOPICS } from "./data";
import { memberName } from "./members";
import type {
  Channel,
  ChannelKind,
  ChatFolder,
  ConvPriority,
  ConversationStatus,
  DisappearTimer,
  FileAttachment,
  Message,
  MessagePriority,
  Poll,
  Topic,
} from "./types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const firstTopicOf = (topics: Topic[], channelId: string) =>
  topics.find((t) => t.channelId === channelId)?.id ?? "";

interface MessagingState {
  channels: Channel[];
  topics: Topic[];
  messages: Message[];
  activeChannelId: string;
  activeTopicId: string;
  threadRootId: string | null;
  search: string;
  savedOnly: boolean;
  folder: ChatFolder;
  replyTargetId: string | null;
  draftsByTopic: Record<string, string>;

  setChannel: (id: string) => void;
  setTopic: (id: string) => void;
  openThread: (id: string) => void;
  closeThread: () => void;
  setSearch: (q: string) => void;
  toggleSavedOnly: () => void;
  setFolder: (f: ChatFolder) => void;
  setReplyTarget: (id: string | null) => void;
  setDraft: (topicId: string, text: string) => void;

  send: (text: string, authorId: string, replyToId?: string | null, silent?: boolean) => void;
  reply: (parentId: string, text: string, authorId: string) => void;
  sendNote: (text: string, authorId: string) => void;
  sendVoice: (seconds: number, authorId: string) => void;
  scheduleMessage: (text: string, authorId: string) => void;
  sendScheduledNow: (id: string) => void;
  deleteScheduled: (id: string) => void;
  postCall: (meetingId: string, authorId: string) => void;
  /** Post into a specific channel/topic (used by the meeting↔chat bridge). */
  postExternal: (channelId: string, topicId: string, text: string, authorId: string) => void;

  editMessage: (id: string, text: string) => void;
  deleteForEveryone: (id: string) => void;
  deleteForMe: (id: string) => void;
  /** Undo a delete-for-me (un-hide the message). */
  restoreForMe: (id: string) => void;
  togglePin: (id: string) => void;
  toggleSave: (id: string) => void;
  toggleImportant: (id: string) => void;
  /** Set a message's Teams priority (normal/important/urgent). */
  setMessagePriority: (id: string, priority: MessagePriority) => void;
  forward: (id: string, toChannelId: string) => void;

  togglePinChat: (id: string) => void;
  toggleMuteChat: (id: string) => void;
  toggleMarkUnread: (id: string) => void;
  setStatus: (channelId: string, status: ConversationStatus) => void;
  setPriority: (channelId: string, priority: ConvPriority) => void;
  setDisappearing: (channelId: string, mode: DisappearTimer) => void;
  submitCsat: (channelId: string, rating: number) => void;

  detailsOpen: boolean;
  toggleDetails: () => void;

  createPoll: (question: string, options: string[], opts: { multi?: boolean; anonymous?: boolean; quiz?: boolean; correctIndex?: number }, authorId: string) => void;
  vote: (messageId: string, optionId: string, userId: string) => void;
  closePoll: (messageId: string) => void;

  toggleReaction: (messageId: string, emoji: string, userId: string) => void;
  translate: (messageId: string) => void;

  // Conversation & content creation
  createChannel: (name: string, kind: ChannelKind) => void;
  createDm: (memberIds: string[]) => void;
  archiveChannel: (id: string) => void;
  sendFile: (file: FileAttachment, authorId: string) => void;
  sendSticker: (sticker: string, authorId: string) => void;
}

const DEFAULT_CHANNEL = CHANNELS[0].id;

type Setter = (fn: (s: MessagingState) => Partial<MessagingState>) => void;

const patchMessage = (set: Setter, id: string, fn: (m: Message) => Message) =>
  set((s) => ({ messages: s.messages.map((m) => (m.id === id ? fn(m) : m)) }));

const progressDelivery = (set: Setter, id: string) => {
  setTimeout(() => patchMessage(set, id, (m) => ({ ...m, status: "sent" })), 600);
  setTimeout(() => patchMessage(set, id, (m) => ({ ...m, status: "delivered" })), 1300);
  setTimeout(() => patchMessage(set, id, (m) => ({ ...m, status: "read" })), 2600);
};

export const useMessagingStore = create<MessagingState>((set, get) => ({
  channels: CHANNELS,
  topics: TOPICS,
  messages: MESSAGES,
  activeChannelId: DEFAULT_CHANNEL,
  activeTopicId: firstTopicOf(TOPICS, DEFAULT_CHANNEL),
  threadRootId: null,
  search: "",
  savedOnly: false,
  folder: "all",
  replyTargetId: null,
  draftsByTopic: {},
  detailsOpen: false,

  setChannel: (id) =>
    set((s) => ({
      activeChannelId: id,
      activeTopicId: firstTopicOf(s.topics, id),
      threadRootId: null,
      search: "",
      replyTargetId: null,
      // Opening a chat clears its unread state.
      channels: s.channels.map((c) =>
        c.id === id ? { ...c, unread: 0, unreadManual: false } : c,
      ),
    })),
  setTopic: (id) => set({ activeTopicId: id, threadRootId: null, replyTargetId: null }),
  openThread: (id) => set({ threadRootId: id }),
  closeThread: () => set({ threadRootId: null }),
  setSearch: (q) => set({ search: q }),
  toggleSavedOnly: () => set((s) => ({ savedOnly: !s.savedOnly })),
  setFolder: (folder) => set({ folder }),
  setReplyTarget: (id) => set({ replyTargetId: id }),
  setDraft: (topicId, text) =>
    set((s) => ({ draftsByTopic: { ...s.draftsByTopic, [topicId]: text } })),

  send: (text, authorId, replyToId = null, silent = false) => {
    const { activeChannelId, activeTopicId } = get();
    const ch = get().channels.find((c) => c.id === activeChannelId);
    const ephemeral = !!ch?.disappearing && ch.disappearing !== "off";
    const id = uid();
    const msg: Message = {
      id,
      channelId: activeChannelId,
      topicId: activeTopicId,
      parentId: null,
      authorId,
      body: text,
      tMinutes: 0,
      reactions: [],
      status: "sending",
      replyToId: replyToId ?? null,
      silent: silent || undefined,
      ephemeral: ephemeral || undefined,
    };
    set((s) => ({
      messages: [...s.messages, msg],
      replyTargetId: null,
      draftsByTopic: { ...s.draftsByTopic, [activeTopicId]: "" },
    }));
    progressDelivery(set, id);
  },

  reply: (parentId, text, authorId) => {
    const root = get().messages.find((m) => m.id === parentId);
    if (!root) return;
    const id = uid();
    set((s) => ({
      messages: [
        ...s.messages,
        { id, channelId: root.channelId, topicId: root.topicId, parentId, authorId, body: text, tMinutes: 0, reactions: [], status: "sending" },
      ],
    }));
    progressDelivery(set, id);
  },

  sendNote: (text, authorId) => {
    const { activeChannelId, activeTopicId } = get();
    set((s) => ({
      messages: [
        ...s.messages,
        { id: uid(), channelId: activeChannelId, topicId: activeTopicId, parentId: null, authorId, body: text, tMinutes: 0, reactions: [], kind: "note" },
      ],
    }));
  },

  sendVoice: (seconds, authorId) => {
    const { activeChannelId, activeTopicId } = get();
    const id = uid();
    set((s) => ({
      messages: [
        ...s.messages,
        { id, channelId: activeChannelId, topicId: activeTopicId, parentId: null, authorId, body: "", tMinutes: 0, reactions: [], kind: "voice", voiceSec: seconds, status: "sending" },
      ],
    }));
    progressDelivery(set, id);
  },

  scheduleMessage: (text, authorId) => {
    const { activeChannelId, activeTopicId } = get();
    set((s) => ({
      messages: [
        ...s.messages,
        { id: uid(), channelId: activeChannelId, topicId: activeTopicId, parentId: null, authorId, body: text, tMinutes: 0, reactions: [], scheduled: true },
      ],
    }));
  },
  sendScheduledNow: (id) => {
    patchMessage(set, id, (m) => ({ ...m, scheduled: false, status: "sending", tMinutes: 0 }));
    progressDelivery(set, id);
  },
  deleteScheduled: (id) => set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),

  postCall: (meetingId, authorId) => {
    const { activeChannelId, activeTopicId } = get();
    set((s) => ({
      messages: [
        ...s.messages,
        { id: uid(), channelId: activeChannelId, topicId: activeTopicId, parentId: null, authorId, body: "", tMinutes: 0, reactions: [], kind: "call", callMeetingId: meetingId },
      ],
    }));
  },

  postExternal: (channelId, topicId, text, authorId) => {
    if (!text.trim()) return;
    const id = uid();
    set((s) => ({
      messages: [
        ...s.messages,
        { id, channelId, topicId, parentId: null, authorId, body: text, tMinutes: 0, reactions: [], status: "sending" },
      ],
    }));
    progressDelivery(set, id);
  },

  editMessage: (id, text) => patchMessage(set, id, (m) => ({ ...m, body: text, edited: true })),
  deleteForEveryone: (id) =>
    patchMessage(set, id, (m) => ({ ...m, deleted: true, body: "", reactions: [] })),
  deleteForMe: (id) => patchMessage(set, id, (m) => ({ ...m, hiddenForMe: true })),
  restoreForMe: (id) => patchMessage(set, id, (m) => ({ ...m, hiddenForMe: false })),
  togglePin: (id) => patchMessage(set, id, (m) => ({ ...m, pinned: !m.pinned })),
  toggleSave: (id) => patchMessage(set, id, (m) => ({ ...m, saved: !m.saved })),
  setMessagePriority: (id, priority) => patchMessage(set, id, (m) => ({ ...m, priority })),
  toggleImportant: (id) => patchMessage(set, id, (m) => ({ ...m, important: !m.important })),

  forward: (id, toChannelId) => {
    const src = get().messages.find((m) => m.id === id);
    if (!src) return;
    const srcChannel = get().channels.find((c) => c.id === src.channelId);
    const from = srcChannel?.kind === "dm" ? srcChannel.name : `#${srcChannel?.name ?? ""}`;
    const newId = uid();
    set((s) => ({
      messages: [
        ...s.messages,
        { id: newId, channelId: toChannelId, topicId: firstTopicOf(get().topics, toChannelId), parentId: null, authorId: "usr_1", body: src.body, bodyAlt: src.bodyAlt, tMinutes: 0, reactions: [], status: "sending", forwardedFrom: from },
      ],
    }));
    progressDelivery(set, newId);
  },

  togglePinChat: (id) =>
    set((s) => ({ channels: s.channels.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)) })),
  toggleMuteChat: (id) =>
    set((s) => ({ channels: s.channels.map((c) => (c.id === id ? { ...c, muted: !c.muted } : c)) })),
  setStatus: (channelId, status) =>
    set((s) => ({ channels: s.channels.map((c) => (c.id === channelId ? { ...c, status } : c)) })),
  toggleMarkUnread: (id) =>
    set((s) => ({
      channels: s.channels.map((c) =>
        c.id === id
          ? { ...c, unreadManual: !c.unreadManual, unread: !c.unreadManual ? c.unread || 1 : 0 }
          : c,
      ),
    })),
  setPriority: (channelId, priority) =>
    set((s) => ({ channels: s.channels.map((c) => (c.id === channelId ? { ...c, priority } : c)) })),
  setDisappearing: (channelId, mode) =>
    set((s) => ({ channels: s.channels.map((c) => (c.id === channelId ? { ...c, disappearing: mode } : c)) })),
  submitCsat: (channelId, rating) =>
    set((s) => ({ channels: s.channels.map((c) => (c.id === channelId ? { ...c, csat: rating, status: "resolved" } : c)) })),

  toggleDetails: () => set((s) => ({ detailsOpen: !s.detailsOpen })),

  createPoll: (question, options, opts, authorId) => {
    const { activeChannelId, activeTopicId } = get();
    const poll: Poll = {
      id: uid(),
      question,
      options: options
        .filter((o) => o.trim())
        .map((text, i) => ({ id: `o${i}`, text, votes: [] })),
      multi: opts.multi,
      anonymous: opts.anonymous,
      quiz: opts.quiz,
      correctOptionId:
        opts.quiz && opts.correctIndex != null ? `o${opts.correctIndex}` : undefined,
    };
    set((s) => ({
      messages: [
        ...s.messages,
        { id: uid(), channelId: activeChannelId, topicId: activeTopicId, parentId: null, authorId, body: "", tMinutes: 0, reactions: [], kind: "poll", poll },
      ],
    }));
  },
  vote: (messageId, optionId, userId) =>
    set((s) => ({
      messages: s.messages.map((m) => {
        if (m.id !== messageId || !m.poll || m.poll.closed) return m;
        const multi = m.poll.multi;
        const options = m.poll.options.map((o) => {
          if (o.id === optionId) {
            const has = o.votes.includes(userId);
            return { ...o, votes: has ? o.votes.filter((u) => u !== userId) : [...o.votes, userId] };
          }
          if (!multi) return { ...o, votes: o.votes.filter((u) => u !== userId) };
          return o;
        });
        return { ...m, poll: { ...m.poll, options } };
      }),
    })),
  closePoll: (messageId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId && m.poll ? { ...m, poll: { ...m.poll, closed: true } } : m,
      ),
    })),

  toggleReaction: (messageId, emoji, userId) =>
    set((s) => ({
      messages: s.messages.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions.find((r) => r.emoji === emoji);
        let reactions = m.reactions;
        if (!existing) reactions = [...m.reactions, { emoji, userIds: [userId] }];
        else if (existing.userIds.includes(userId))
          reactions = m.reactions
            .map((r) => (r.emoji === emoji ? { ...r, userIds: r.userIds.filter((u) => u !== userId) } : r))
            .filter((r) => r.userIds.length > 0);
        else reactions = m.reactions.map((r) => (r.emoji === emoji ? { ...r, userIds: [...r.userIds, userId] } : r));
        return { ...m, reactions };
      }),
    })),

  translate: (messageId) => {
    patchMessage(set, messageId, (m) => ({ ...m, translating: true }));
    setTimeout(
      () =>
        patchMessage(set, messageId, (m) => ({
          ...m,
          translating: false,
          translated: true,
          bodyAlt: m.bodyAlt ?? `(translated) ${m.body}`,
        })),
      450,
    );
  },

  createChannel: (name, kind) => {
    const id = `ch_${uid()}`;
    const topicId = `tp_${id}`;
    set((s) => ({
      channels: [...s.channels, { id, kind, name }],
      topics: [...s.topics, { id: topicId, channelId: id, title: "general" }],
      activeChannelId: id,
      activeTopicId: topicId,
      threadRootId: null,
      search: "",
      replyTargetId: null,
      folder: "all",
    }));
  },
  createDm: (memberIds) => {
    const id = `dm_${uid()}`;
    const topicId = `tp_${id}`;
    const names = memberIds.map(memberName);
    const name =
      memberIds.length === 1
        ? names[0]
        : `${names.slice(0, 2).join(", ")}${memberIds.length > 2 ? ` +${memberIds.length - 2}` : ""}`;
    set((s) => ({
      channels: [
        ...s.channels,
        { id, kind: "dm", name, dmUserId: memberIds.length === 1 ? memberIds[0] : undefined, memberIds, e2ee: true },
      ],
      topics: [...s.topics, { id: topicId, channelId: id, title: "main" }],
      activeChannelId: id,
      activeTopicId: topicId,
      threadRootId: null,
      search: "",
      replyTargetId: null,
      folder: "all",
    }));
  },
  archiveChannel: (id) =>
    set((s) => ({ channels: s.channels.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)) })),
  sendFile: (file, authorId) => {
    const { activeChannelId, activeTopicId } = get();
    const id = uid();
    set((s) => ({
      messages: [
        ...s.messages,
        { id, channelId: activeChannelId, topicId: activeTopicId, parentId: null, authorId, body: file.name, tMinutes: 0, reactions: [], kind: "file", file, status: "sending" },
      ],
    }));
    progressDelivery(set, id);
  },
  sendSticker: (sticker, authorId) => {
    const { activeChannelId, activeTopicId } = get();
    const id = uid();
    set((s) => ({
      messages: [
        ...s.messages,
        { id, channelId: activeChannelId, topicId: activeTopicId, parentId: null, authorId, body: "", tMinutes: 0, reactions: [], kind: "sticker", sticker, status: "sending" },
      ],
    }));
    progressDelivery(set, id);
  },
}));
