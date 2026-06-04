import type { CaptionLine, MeetingChat, MeetingSummary, Participant, VideoRoom } from "./types";

/** Upcoming / live meetings (landing). */
export const MEETINGS: MeetingSummary[] = [
  {
    id: "mtg_standup",
    title: "Daily Standup",
    host: "Defne Yıldız",
    startsInMin: 0,
    live: true,
    participantIds: ["usr_1", "usr_2", "usr_3", "usr_4", "usr_5"],
  },
  {
    id: "mtg_q3",
    title: "Q3 Launch Review",
    host: "Ismail K.",
    startsInMin: 15,
    participantIds: ["usr_1", "usr_2", "usr_3"],
  },
  {
    id: "mtg_design",
    title: "Design Critique",
    host: "Aylin Çetin",
    startsInMin: 60,
    participantIds: ["usr_4", "usr_2"],
  },
];

/** Participants of the active room (self + others). */
export const ROOM_PARTICIPANTS: Participant[] = [
  { id: "usr_1", name: "Ismail K.", role: "host", micOn: true, camOn: false, handRaised: false, isSelf: true, quality: "good" },
  { id: "usr_2", name: "Defne Yıldız", role: "cohost", micOn: true, camOn: true, handRaised: false, quality: "good" },
  { id: "usr_3", name: "Marco Rossi", role: "attendee", micOn: false, camOn: true, handRaised: true, quality: "fair" },
  { id: "usr_4", name: "Aylin Çetin", role: "attendee", micOn: true, camOn: false, handRaised: false, quality: "good" },
  { id: "usr_5", name: "Tom Becker", role: "attendee", micOn: false, camOn: false, handRaised: false, quality: "poor" },
];

/** Persistent video rooms (moderator-created). */
export const ROOMS: VideoRoom[] = [
  { id: "room_war", name: "War Room", createdBy: "usr_1", locked: false, waitingRoom: true, participants: 3 },
  { id: "room_design", name: "Design Studio", createdBy: "usr_4", locked: true, waitingRoom: false, participants: 0 },
  { id: "room_allhands", name: "All Hands", createdBy: "usr_1", locked: false, waitingRoom: true, participants: 12 },
];

/** Someone waiting in the lobby (host admits). */
export const LOBBY_SEED = [{ id: "usr_6", name: "Sara Lindqvist" }];

/** Simulated live transcript (bilingual). Cycles while captions are on. */
export const CAPTION_SCRIPT: CaptionLine[] = [
  { speakerId: "usr_2", en: "Morning everyone — quick standup.", tr: "Günaydın herkese — kısa standup." },
  { speakerId: "usr_3", en: "Backend load test passed at 12k concurrent.", tr: "Backend yük testi 12k eşzamanlıda geçti." },
  { speakerId: "usr_4", en: "Dark-mode tokens are merged.", tr: "Koyu mod token'ları birleştirildi." },
  { speakerId: "usr_1", en: "Great. Go/no-go is at 15:00.", tr: "Harika. Go/no-go saat 15:00'te." },
  { speakerId: "usr_2", en: "Pricing page lands by 14:00.", tr: "Fiyat sayfası 14:00'e iniyor." },
  { speakerId: "usr_5", en: "CI flakiness is fixed now.", tr: "CI kararsızlığı artık düzeldi." },
];

export const MEETING_CHAT_SEED: MeetingChat[] = [
  { id: "c1", authorId: "usr_3", body: "Sharing the dashboard now.", tMin: 4 },
  { id: "c2", authorId: "usr_4", body: "Looks great 🎉", tMin: 3 },
  { id: "c3", authorId: "usr_2", body: "Recording for those who missed it.", tMin: 1 },
];

/** Seed Q&A questions for the in-meeting Engage panel. */
export const QNA_SEED = [
  { id: "q1", authorId: "usr_3", text: "Will the launch include the EU region on day one?", upvotes: ["usr_4", "usr_2"], answered: false },
  { id: "q2", authorId: "usr_5", text: "Can we get the pricing slide afterwards?", upvotes: ["usr_4"], answered: false },
];
