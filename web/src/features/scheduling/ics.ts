/**
 * iCalendar (.ics) builder for a confirmed booking (B1 — Calendly parity).
 * Pure + framework-free so it's unit-tested directly; the UI feeds the result
 * to lib/download. RFC 5545 VEVENT, UTC basic time format.
 */
function icsDate(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

export interface IcsInput {
  start: number; // epoch ms
  durationMin: number;
  title: string;
  attendeeEmail?: string;
}

export function buildIcs({ start, durationMin, title, attendeeEmail }: IcsInput): string {
  const end = start + durationMin * 60_000;
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AURA//Scheduling//EN",
    "BEGIN:VEVENT",
    `UID:aura-${start}@aura.local`,
    `DTSTAMP:${icsDate(Date.now())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${esc(title)}`,
    attendeeEmail ? `ATTENDEE;CN=${esc(attendeeEmail)}:mailto:${attendeeEmail}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
