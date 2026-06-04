/** Pure Google-Meet-parity helpers (attendance + breakout countdown). Testable. */

export interface Attendance {
  invited: number;
  present: number;
  noShow: number;
  rate: number; // 0..1
}

/** Attendance report from an invited roster vs. who actually joined. */
export function attendanceReport(invitedIds: string[], presentIds: string[]): Attendance {
  const invited = invitedIds.length;
  const present = invitedIds.filter((id) => presentIds.includes(id)).length;
  return { invited, present, noShow: invited - present, rate: invited ? present / invited : 0 };
}

export interface Countdown {
  remainingSec: number;
  expired: boolean;
}

/** Breakout auto-return countdown. */
export function breakoutCountdown(endsAtMs: number, nowMs: number): Countdown {
  return { remainingSec: Math.max(0, Math.ceil((endsAtMs - nowMs) / 1000)), expired: nowMs >= endsAtMs };
}

/** Per-viewer meeting watermark (anti-leak overlay). */
export function watermarkLabel(userName: string, meetingId: string, sec: number): string {
  const mm = Math.floor(sec / 60);
  const ss = String(sec % 60).padStart(2, "0");
  return `${userName} · ${meetingId} · ${mm}:${ss}`;
}

/**
 * Searchable meeting archive — the central, linked hub (recap + transcript +
 * recording) that Google Meet lacks ("çıktı dağınıklığı / panel yok").
 */
export interface ArchiveEntry {
  id: string;
  title: string;
  dateMs: number;
  hasRecording: boolean;
  hasTranscript: boolean;
  summary: string;
}

export const MEETING_ARCHIVE: ArchiveEntry[] = [
  { id: "arc1", title: "Daily Standup", dateMs: Date.now() - 86_400_000, hasRecording: true, hasTranscript: true, summary: "Q3 launch on track; pricing page lands 14:00." },
  { id: "arc2", title: "Sales call — Acme", dateMs: Date.now() - 2 * 86_400_000, hasRecording: true, hasTranscript: true, summary: "Objection handled; proposal sent." },
  { id: "arc3", title: "Design sync", dateMs: Date.now() - 3 * 86_400_000, hasRecording: false, hasTranscript: true, summary: "Dark-mode tokens merged and propagating." },
];

/** Full-text search over the meeting archive (title + summary). */
export function searchArchive(entries: ArchiveEntry[], q: string): ArchiveEntry[] {
  const s = q.trim().toLowerCase();
  if (!s) return entries;
  return entries.filter((e) => e.title.toLowerCase().includes(s) || e.summary.toLowerCase().includes(s));
}
