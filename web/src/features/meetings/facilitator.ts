/**
 * AI Facilitator agent (Teams "Facilitator" parity) — pure, framework-free.
 * Builds a timed agenda, tracks where the meeting sits against it, and mines
 * the live transcript for action items. The backend would run the same logic.
 */

export interface AgendaInput {
  title: string;
  minutes: number;
}

export interface AgendaItem extends AgendaInput {
  startMin: number;
  endMin: number;
}

/** Lay agenda items on a cumulative timeline (minutes from meeting start). */
export function buildAgenda(items: AgendaInput[]): AgendaItem[] {
  let acc = 0;
  return items.map((it) => {
    const startMin = acc;
    acc += Math.max(0, it.minutes);
    return { ...it, startMin, endMin: acc };
  });
}

/** Total planned duration of an agenda (minutes). */
export function agendaTotal(items: AgendaInput[]): number {
  return items.reduce((n, i) => n + Math.max(0, i.minutes), 0);
}

export interface AgendaProgress {
  index: number;
  current: AgendaItem | null;
  /** Minutes the meeting has run past the whole agenda (0 while on schedule). */
  overrunMin: number;
  done: boolean;
}

/** Where the meeting sits on its agenda, given elapsed minutes. */
export function agendaProgress(agenda: AgendaItem[], elapsedMin: number): AgendaProgress {
  if (agenda.length === 0) return { index: -1, current: null, overrunMin: 0, done: true };
  const total = agenda[agenda.length - 1].endMin;
  if (elapsedMin >= total) {
    return { index: agenda.length - 1, current: agenda[agenda.length - 1], overrunMin: elapsedMin - total, done: true };
  }
  const index = agenda.findIndex((a) => elapsedMin < a.endMin);
  return { index, current: agenda[index], overrunMin: 0, done: false };
}

export interface ActionItem {
  text: string;
  owner: string;
}

/** Cue words that mark a transcript line as a commitment / action. */
const ACTION_CUE = /\b(action item|todo|to-?do|follow[- ]?up|will|i'?ll|we'?ll|let'?s|assign|by (monday|tuesday|wednesday|thursday|friday|tomorrow|eod|next week))\b/i;

/** Mine action items from transcript lines; owner defaults to the speaker. */
export function extractActionItems(lines: { speaker: string; text: string }[]): ActionItem[] {
  return lines
    .filter((l) => ACTION_CUE.test(l.text))
    .map((l) => ({ text: l.text.trim(), owner: l.speaker }));
}

export interface MeetingChapter {
  index: number;
  title: string;
  lineCount: number;
}

/**
 * AI meeting chapters (Webex parity): segment the transcript into chapters of
 * `perChapter` lines; the chapter title is the first line, truncated.
 */
export function meetingChapters(lines: { speaker: string; text: string }[], perChapter = 4): MeetingChapter[] {
  const chapters: MeetingChapter[] = [];
  for (let i = 0; i < lines.length; i += perChapter) {
    const slice = lines.slice(i, i + perChapter);
    const head = slice[0]?.text.trim() ?? "";
    chapters.push({
      index: chapters.length,
      title: head.length > 48 ? `${head.slice(0, 48)}…` : head,
      lineCount: slice.length,
    });
  }
  return chapters;
}
