import { create } from "zustand";
import { capArray } from "@/lib/capArray";
import {
  CAPTION_SCRIPT,
  LOBBY_SEED,
  MEETINGS,
  MEETING_CHAT_SEED,
  QNA_SEED,
  ROOM_PARTICIPANTS,
  ROOMS,
} from "./data";
import { memberName } from "@/lib/identity";
import { buildMeetingNotes, togglePinList } from "./meetGm";
import type {
  AccessTier,
  BandwidthPolicy,
  Breakout,
  Caption,
  CaptionLang,
  FloatingReaction,
  MeetingChat,
  MeetingLayout,
  MeetingNotes,
  MeetingPhase,
  MeetingPoll,
  NotesRecipients,
  Participant,
  QnaItem,
  RemoteControl,
  ResolutionLevel,
  SidePanelTab,
  StripPos,
  VideoRoom,
} from "./types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export type MeetFx =
  | "portraitTouchUp"
  | "studioLook"
  | "adaptiveAudio"
  | "liveSharing"
  | "watermark"
  // Zoom in-meeting parity
  | "focusMode"
  | "avatars"
  | "deepfakeDetection"
  | "pushToTalk"
  // Webex parity
  | "gestureRecognition"
  | "immersiveShare"
  | "musicMode"
  | "aiFraming"
  | "nameLabels";

interface MeetingState {
  phase: MeetingPhase;
  activeMeetingId: string | null;
  activeTitle: string;
  /** When started from a chat: the linked messaging channel/topic (2↔3 bridge). */
  linkedChannelId: string | null;
  linkedTopicId: string | null;

  // Moderator / host state
  rooms: VideoRoom[];
  locked: boolean;
  waitingRoom: boolean;
  allowAttendeeShare: boolean;
  allowAttendeeChat: boolean;
  spotlightId: string | null;
  meetingPoll: MeetingPoll | null;
  qna: QnaItem[];
  whiteboardOpen: boolean;

  // local (self) media
  micOn: boolean;
  camOn: boolean;
  screenSharing: boolean;
  handRaised: boolean;
  blurOn: boolean;
  aiCompanion: boolean;
  // Faz 10/D — Google Meet parity
  companionMode: boolean; // second-device companion join
  noiseCancellation: boolean;
  breakoutEndsAt: number | null; // breakout auto-return countdown target (epoch ms)
  // Meet parity++ — capture & quality effects (Google Meet inventory gaps)
  portraitTouchUp: boolean;
  studioLook: boolean;
  adaptiveAudio: boolean; // merge multiple laptops in a hybrid room
  liveSharing: boolean; // co-watch (YouTube/music synced)
  watermark: boolean;
  // Zoom in-meeting parity — controls & safety
  focusMode: boolean; // hide other participants' video from each other
  avatars: boolean; // animated/3D avatar instead of camera
  deepfakeDetection: boolean; // flag synthetic faces/voices
  pushToTalk: boolean; // hold-to-unmute (space) mode
  // Webex parity — capture & audio/video intelligence
  gestureRecognition: boolean; // camera detects thumbs/clap/raise-hand
  immersiveShare: boolean; // presenter video composited over shared content
  musicMode: boolean; // hi-fi audio (disable noise suppression for music)
  aiFraming: boolean; // AI camera auto-framing
  nameLabels: boolean; // facial name labels over video tiles

  // Google Meet parity — granular moderation, quality, AI notes, remote control
  audioLock: boolean; // block self-unmute
  videoLock: boolean; // force cameras off
  accessTier: AccessTier; // open / trusted / restricted
  requireConsent: boolean; // require consent before recording/notes
  pinnedIds: string[]; // multi-pin (up to 6)
  annotateOn: boolean; // native annotation over shared content
  remoteControl: RemoteControl | null; // real-time remote screen control
  meetingNotes: MeetingNotes | null; // "Take Notes for Me" output
  noteSections: { summary: boolean; decisions: boolean; nextSteps: boolean };
  notesRecipients: NotesRecipients;
  speechTranslation: boolean; // real-time voice dubbing
  speechFrom: string;
  speechTo: string;
  sendResolution: ResolutionLevel;
  receiveResolution: ResolutionLevel;
  bandwidthPolicy: BandwidthPolicy;
  dataSaver: boolean;

  layout: MeetingLayout;
  stripPos: StripPos;
  sidePanel: SidePanelTab;
  recording: boolean;
  recordSec: number;
  captionsOn: boolean;
  captionLang: CaptionLang;

  participants: Participant[];
  activeSpeakerId: string | null;
  lobbyQueue: { id: string; name: string }[];
  captions: Caption[];
  captionIndex: number;
  reactions: FloatingReaction[];
  breakouts: Breakout[];
  chat: MeetingChat[];

  // navigation
  openPrejoin: (meetingId: string) => void;
  startInstant: () => void;
  startFromChannel: (channelId: string, topicId: string, title: string) => void;
  join: () => void;
  leave: () => void;

  // Persistent rooms + moderator controls
  createRoom: (name: string, opts: { locked?: boolean; waitingRoom?: boolean; password?: string }) => void;
  deleteRoom: (id: string) => void;
  joinRoom: (id: string) => void;
  muteAll: () => void;
  lowerAllHands: () => void;
  removeParticipant: (id: string) => void;
  makeCoHost: (id: string) => void;
  toggleSpotlight: (id: string) => void;
  toggleParticipantHand: (id: string) => void;
  toggleLock: () => void;
  toggleWaitingRoom: () => void;
  toggleAttendeeShare: () => void;
  toggleAttendeeChat: () => void;
  endForAll: () => void;

  // Google Meet parity — moderation, quality, AI notes, remote control
  toggleAudioLock: () => void;
  toggleVideoLock: () => void;
  setAccessTier: (tier: AccessTier) => void;
  makeViewer: (id: string) => void;
  sendToWaitingRoom: (id: string) => void;
  toggleRequireConsent: () => void;
  togglePin: (id: string) => void;
  toggleAnnotate: () => void;
  requestRemoteControl: (presenterId: string) => void;
  grantRemoteControl: (controllerId: string) => void;
  stopRemoteControl: () => void;
  generateNotes: () => void;
  toggleNoteSection: (key: "summary" | "decisions" | "nextSteps") => void;
  setNotesRecipients: (r: NotesRecipients) => void;
  toggleSpeechTranslation: () => void;
  setSpeechPair: (from: string, to: string) => void;
  setSendResolution: (r: ResolutionLevel) => void;
  setReceiveResolution: (r: ResolutionLevel) => void;
  setBandwidthPolicy: (p: BandwidthPolicy) => void;
  toggleDataSaver: () => void;

  // In-meeting engagement
  launchPoll: (question: string, options: string[]) => void;
  votePoll: (optionId: string, userId: string) => void;
  closeMeetingPoll: () => void;
  askQuestion: (text: string, authorId: string) => void;
  upvoteQuestion: (id: string, userId: string) => void;
  answerQuestion: (id: string) => void;
  toggleWhiteboard: () => void;

  // controls
  toggleMic: () => void;
  toggleCam: () => void;
  toggleScreen: () => void;
  toggleHand: () => void;
  toggleBlur: () => void;
  toggleAiCompanion: () => void;
  toggleCompanion: () => void;
  toggleNoiseCancellation: () => void;
  startBreakoutTimer: (minutes: number) => void;
  clearBreakoutTimer: () => void;
  toggleMeetFx: (key: MeetFx) => void;
  setLayout: (l: MeetingLayout) => void;
  setStripPos: (p: StripPos) => void;
  setSidePanel: (t: SidePanelTab) => void;
  toggleRecording: () => void;
  toggleCaptions: () => void;
  setCaptionLang: (l: CaptionLang) => void;

  toggleParticipantMute: (id: string) => void;
  admit: (id: string) => void;
  denyLobby: (id: string) => void;
  sendReaction: (emoji: string) => void;
  createBreakouts: (n: number) => void;
  closeBreakouts: () => void;
  sendChat: (text: string, authorId: string) => void;

  // simulation ticks (driven by MeetingRoom effects)
  pushCaption: () => void;
  rotateSpeaker: () => void;
  tickRecord: () => void;
}

const titleOf = (id: string) =>
  MEETINGS.find((m) => m.id === id)?.title ?? "Instant meeting";

export const useMeetingStore = create<MeetingState>((set, get) => ({
  phase: "idle",
  activeMeetingId: null,
  activeTitle: "",
  linkedChannelId: null,
  linkedTopicId: null,

  rooms: ROOMS,
  locked: false,
  waitingRoom: true,
  allowAttendeeShare: true,
  allowAttendeeChat: true,
  spotlightId: null,
  meetingPoll: null,
  qna: [],
  whiteboardOpen: false,

  micOn: true,
  camOn: false,
  screenSharing: false,
  handRaised: false,
  blurOn: false,
  aiCompanion: true,
  companionMode: false,
  noiseCancellation: false,
  breakoutEndsAt: null,
  portraitTouchUp: false,
  studioLook: false,
  adaptiveAudio: false,
  liveSharing: false,
  watermark: false,
  focusMode: false,
  avatars: false,
  deepfakeDetection: false,
  pushToTalk: false,
  gestureRecognition: false,
  immersiveShare: false,
  musicMode: false,
  aiFraming: false,
  nameLabels: false,

  // Google Meet parity
  audioLock: false,
  videoLock: false,
  accessTier: "trusted",
  requireConsent: false,
  pinnedIds: [],
  annotateOn: false,
  remoteControl: null,
  meetingNotes: null,
  noteSections: { summary: true, decisions: true, nextSteps: true },
  notesRecipients: "inorg",
  speechTranslation: false,
  speechFrom: "en",
  speechTo: "tr",
  sendResolution: "auto",
  receiveResolution: "auto",
  bandwidthPolicy: "auto",
  dataSaver: false,

  layout: "grid",
  stripPos: "bottom",
  sidePanel: "none",
  recording: false,
  recordSec: 0,
  captionsOn: false,
  captionLang: "en",

  participants: [],
  activeSpeakerId: null,
  lobbyQueue: [],
  captions: [],
  captionIndex: 0,
  reactions: [],
  breakouts: [],
  chat: [],

  openPrejoin: (meetingId) =>
    set({
      phase: "prejoin",
      activeMeetingId: meetingId,
      activeTitle: titleOf(meetingId),
      linkedChannelId: null,
      linkedTopicId: null,
    }),
  startInstant: () =>
    set({
      phase: "prejoin",
      activeMeetingId: "mtg_instant",
      activeTitle: "Instant meeting",
      linkedChannelId: null,
      linkedTopicId: null,
    }),
  startFromChannel: (channelId, topicId, title) =>
    set({
      phase: "prejoin",
      activeMeetingId: `mtg_${channelId}`,
      activeTitle: title,
      linkedChannelId: channelId,
      linkedTopicId: topicId,
    }),

  join: () => {
    const { micOn, camOn } = get();
    const participants = ROOM_PARTICIPANTS.map((p) =>
      p.isSelf ? { ...p, micOn, camOn } : { ...p },
    );
    set((s) => ({
      phase: "in",
      participants,
      activeSpeakerId: "usr_2",
      lobbyQueue: s.waitingRoom ? [...LOBBY_SEED] : [],
      chat: [...MEETING_CHAT_SEED],
      captions: [],
      captionIndex: 0,
      recording: false,
      recordSec: 0,
      screenSharing: false,
      sidePanel: "none",
      breakouts: [],
      spotlightId: null,
      meetingPoll: null,
      qna: [...QNA_SEED],
      whiteboardOpen: false,
    }));
  },

  leave: () =>
    set({
      phase: "idle",
      activeMeetingId: null,
      captionsOn: false,
      linkedChannelId: null,
      linkedTopicId: null,
      companionMode: false,
      noiseCancellation: false,
      breakoutEndsAt: null,
      portraitTouchUp: false,
      studioLook: false,
      adaptiveAudio: false,
      liveSharing: false,
      watermark: false,
      focusMode: false,
      avatars: false,
      deepfakeDetection: false,
      pushToTalk: false,
      gestureRecognition: false,
      immersiveShare: false,
      musicMode: false,
      aiFraming: false,
      nameLabels: false,
    }),

  createRoom: (name, opts) =>
    set((s) => ({
      rooms: [
        { id: `room_${uid()}`, name, createdBy: "usr_1", locked: opts.locked, waitingRoom: opts.waitingRoom, password: opts.password, participants: 0 },
        ...s.rooms,
      ],
    })),
  deleteRoom: (id) => set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),
  joinRoom: (id) => {
    const room = get().rooms.find((r) => r.id === id);
    if (!room) return;
    set({
      phase: "prejoin",
      activeMeetingId: room.id,
      activeTitle: room.name,
      locked: !!room.locked,
      waitingRoom: !!room.waitingRoom,
      linkedChannelId: null,
      linkedTopicId: null,
    });
  },
  muteAll: () =>
    set((s) => ({ participants: s.participants.map((p) => (p.isSelf ? p : { ...p, micOn: false })) })),
  lowerAllHands: () =>
    set((s) => ({ participants: s.participants.map((p) => ({ ...p, handRaised: false })) })),
  removeParticipant: (id) =>
    set((s) => ({
      participants: s.participants.filter((p) => p.id !== id),
      spotlightId: s.spotlightId === id ? null : s.spotlightId,
    })),
  makeCoHost: (id) =>
    set((s) => ({ participants: s.participants.map((p) => (p.id === id ? { ...p, role: "cohost" } : p)) })),
  toggleSpotlight: (id) => set((s) => ({ spotlightId: s.spotlightId === id ? null : id })),
  toggleParticipantHand: (id) =>
    set((s) => ({ participants: s.participants.map((p) => (p.id === id ? { ...p, handRaised: !p.handRaised } : p)) })),
  toggleLock: () => set((s) => ({ locked: !s.locked })),
  toggleWaitingRoom: () => set((s) => ({ waitingRoom: !s.waitingRoom })),
  toggleAttendeeShare: () => set((s) => ({ allowAttendeeShare: !s.allowAttendeeShare })),
  toggleAttendeeChat: () => set((s) => ({ allowAttendeeChat: !s.allowAttendeeChat })),
  endForAll: () =>
    set({ phase: "idle", activeMeetingId: null, captionsOn: false, linkedChannelId: null, linkedTopicId: null, participants: [], spotlightId: null }),

  // Google Meet parity — moderation
  toggleAudioLock: () => set((s) => ({ audioLock: !s.audioLock })),
  toggleVideoLock: () => set((s) => ({ videoLock: !s.videoLock })),
  setAccessTier: (accessTier) => set({ accessTier }),
  makeViewer: (id) =>
    set((s) => ({
      participants: s.participants.map((p) => (p.id === id ? { ...p, role: "viewer", micOn: false, camOn: false } : p)),
    })),
  sendToWaitingRoom: (id) =>
    set((s) => {
      const p = s.participants.find((x) => x.id === id);
      if (!p) return {};
      return {
        participants: s.participants.filter((x) => x.id !== id),
        lobbyQueue: [...s.lobbyQueue, { id: p.id, name: p.name }],
      };
    }),
  toggleRequireConsent: () => set((s) => ({ requireConsent: !s.requireConsent })),
  togglePin: (id) => set((s) => ({ pinnedIds: togglePinList(s.pinnedIds, id) })),
  toggleAnnotate: () => set((s) => ({ annotateOn: !s.annotateOn })),

  // remote screen control
  requestRemoteControl: (presenterId) => set({ remoteControl: { presenterId, controllerId: null } }),
  grantRemoteControl: (controllerId) =>
    set((s) => (s.remoteControl ? { remoteControl: { ...s.remoteControl, controllerId } } : {})),
  stopRemoteControl: () => set({ remoteControl: null }),

  // Take Notes for Me
  generateNotes: () => set((s) => ({ meetingNotes: buildMeetingNotes(s.captions) })),
  toggleNoteSection: (key) =>
    set((s) => ({ noteSections: { ...s.noteSections, [key]: !s.noteSections[key] } })),
  setNotesRecipients: (notesRecipients) => set({ notesRecipients }),

  // speech translation (voice dubbing)
  toggleSpeechTranslation: () => set((s) => ({ speechTranslation: !s.speechTranslation })),
  setSpeechPair: (speechFrom, speechTo) => set({ speechFrom, speechTo }),

  // quality / bandwidth
  setSendResolution: (sendResolution) => set({ sendResolution }),
  setReceiveResolution: (receiveResolution) => set({ receiveResolution }),
  setBandwidthPolicy: (bandwidthPolicy) => set({ bandwidthPolicy }),
  toggleDataSaver: () => set((s) => ({ dataSaver: !s.dataSaver })),

  launchPoll: (question, options) =>
    set({
      meetingPoll: {
        question,
        options: options.filter((o) => o.trim()).map((text, i) => ({ id: `mo${i}`, text, votes: [] })),
      },
    }),
  votePoll: (optionId, userId) =>
    set((s) =>
      s.meetingPoll && !s.meetingPoll.closed
        ? {
            meetingPoll: {
              ...s.meetingPoll,
              options: s.meetingPoll.options.map((o) =>
                o.id === optionId
                  ? { ...o, votes: o.votes.includes(userId) ? o.votes.filter((u) => u !== userId) : [...o.votes, userId] }
                  : { ...o, votes: o.votes.filter((u) => u !== userId) },
              ),
            },
          }
        : {},
    ),
  closeMeetingPoll: () =>
    set((s) => (s.meetingPoll ? { meetingPoll: { ...s.meetingPoll, closed: true } } : {})),
  askQuestion: (text, authorId) =>
    set((s) => ({ qna: capArray([...s.qna, { id: uid(), authorId, text, upvotes: [], answered: false }], 100) })),
  upvoteQuestion: (id, userId) =>
    set((s) => ({
      qna: s.qna.map((q) =>
        q.id === id
          ? { ...q, upvotes: q.upvotes.includes(userId) ? q.upvotes.filter((u) => u !== userId) : [...q.upvotes, userId] }
          : q,
      ),
    })),
  answerQuestion: (id) =>
    set((s) => ({ qna: s.qna.map((q) => (q.id === id ? { ...q, answered: true } : q)) })),
  toggleWhiteboard: () => set((s) => ({ whiteboardOpen: !s.whiteboardOpen })),

  toggleMic: () =>
    set((s) => ({
      micOn: !s.micOn,
      participants: s.participants.map((p) => (p.isSelf ? { ...p, micOn: !s.micOn } : p)),
    })),
  toggleCam: () =>
    set((s) => ({
      camOn: !s.camOn,
      participants: s.participants.map((p) => (p.isSelf ? { ...p, camOn: !s.camOn } : p)),
    })),
  toggleScreen: () =>
    set((s) => ({
      screenSharing: !s.screenSharing,
      layout: !s.screenSharing ? "speaker" : s.layout,
      participants: s.participants.map((p) =>
        p.isSelf ? { ...p, screenSharing: !s.screenSharing } : p,
      ),
    })),
  toggleHand: () =>
    set((s) => ({
      handRaised: !s.handRaised,
      participants: s.participants.map((p) =>
        p.isSelf ? { ...p, handRaised: !s.handRaised } : p,
      ),
    })),
  toggleBlur: () => set((s) => ({ blurOn: !s.blurOn })),
  toggleAiCompanion: () => set((s) => ({ aiCompanion: !s.aiCompanion })),
  toggleCompanion: () => set((s) => ({ companionMode: !s.companionMode })),
  toggleNoiseCancellation: () => set((s) => ({ noiseCancellation: !s.noiseCancellation })),
  startBreakoutTimer: (minutes) => set({ breakoutEndsAt: Date.now() + minutes * 60_000 }),
  clearBreakoutTimer: () => set({ breakoutEndsAt: null }),
  toggleMeetFx: (key) => set((s) => ({ [key]: !s[key] }) as Partial<MeetingState>),
  setLayout: (layout) => set({ layout }),
  setStripPos: (stripPos) => set({ stripPos }),
  setSidePanel: (sidePanel) => set({ sidePanel }),
  toggleRecording: () => set((s) => ({ recording: !s.recording, recordSec: 0 })),
  toggleCaptions: () => set((s) => ({ captionsOn: !s.captionsOn })),
  setCaptionLang: (captionLang) => set({ captionLang }),

  toggleParticipantMute: (id) =>
    set((s) => ({
      participants: s.participants.map((p) => (p.id === id ? { ...p, micOn: !p.micOn } : p)),
    })),

  admit: (id) =>
    set((s) => {
      const entry = s.lobbyQueue.find((l) => l.id === id);
      if (!entry) return {};
      const participant: Participant = {
        id: entry.id,
        name: entry.name,
        role: "attendee",
        micOn: false,
        camOn: false,
        handRaised: false,
      };
      return {
        lobbyQueue: s.lobbyQueue.filter((l) => l.id !== id),
        participants: [...s.participants, participant],
      };
    }),
  denyLobby: (id) =>
    set((s) => ({ lobbyQueue: s.lobbyQueue.filter((l) => l.id !== id) })),

  sendReaction: (emoji) => {
    const id = uid();
    set((s) => ({ reactions: capArray([...s.reactions, { id, emoji }], 50) }));
    setTimeout(() => set((s) => ({ reactions: s.reactions.filter((r) => r.id !== id) })), 2500);
  },

  createBreakouts: (n) =>
    set((s) => {
      const others = s.participants.filter((p) => !p.isSelf);
      const rooms: Breakout[] = Array.from({ length: n }, (_, i) => ({
        id: `br_${i + 1}`,
        name: `Room ${i + 1}`,
        participantIds: [],
      }));
      others.forEach((p, i) => rooms[i % n].participantIds.push(p.id));
      return { breakouts: rooms };
    }),
  closeBreakouts: () => set({ breakouts: [] }),

  sendChat: (text, authorId) =>
    set((s) => ({
      chat: capArray([...s.chat, { id: uid(), authorId, body: text, tMin: 0 }], 200),
    })),

  pushCaption: () =>
    set((s) => {
      const line = CAPTION_SCRIPT[s.captionIndex % CAPTION_SCRIPT.length];
      const caption: Caption = {
        id: uid(),
        speaker: memberName(line.speakerId),
        text: s.captionLang === "tr" ? line.tr : line.en,
      };
      return {
        captions: [...s.captions, caption].slice(-30),
        captionIndex: s.captionIndex + 1,
      };
    }),
  rotateSpeaker: () =>
    set((s) => {
      const speakers = s.participants.filter((p) => p.micOn);
      if (speakers.length === 0) return {};
      const next = speakers[Math.floor(Math.random() * speakers.length)];
      return { activeSpeakerId: next.id };
    }),
  tickRecord: () => set((s) => ({ recordSec: s.recordSec + 1 })),
}));
