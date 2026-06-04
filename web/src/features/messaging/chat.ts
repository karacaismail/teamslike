import type { Channel, Community, DeliveryStatus, Message, MessagePriority } from "./types";

/**
 * Pure messaging-domain helpers (delivery state machine, edit window, album
 * grouping, voice waveform, keyword highlight). Framework-free → unit-testable.
 */

const DELIVERY_ORDER: DeliveryStatus[] = ["sending", "sent", "delivered", "read"];

/** Advance the WhatsApp-style delivery ticks one step (read is terminal). */
export function deliveryNext(status: DeliveryStatus): DeliveryStatus {
  const i = DELIVERY_ORDER.indexOf(status);
  return i < 0 || i >= DELIVERY_ORDER.length - 1 ? "read" : DELIVERY_ORDER[i + 1];
}

/** Whether a message is still editable (WhatsApp 15-minute window). */
export function canEditWithin(tMinutes: number, nowMinutes: number, windowMin = 15): boolean {
  return nowMinutes - tMinutes <= windowMin && nowMinutes >= tMinutes;
}

/**
 * Group consecutive media messages from the same author within `gapMin` into
 * albums (WhatsApp/Telegram grouped media). Non-media messages stay singletons.
 */
export function groupAlbums(messages: Message[], gapMin = 2): Message[][] {
  const out: Message[][] = [];
  for (const m of messages) {
    const isMedia = (m.kind === "file" && m.file?.isImage) || m.kind === "sticker";
    const last = out[out.length - 1];
    const lastMsg = last?.[last.length - 1];
    if (
      isMedia &&
      lastMsg &&
      ((lastMsg.kind === "file" && lastMsg.file?.isImage) || lastMsg.kind === "sticker") &&
      lastMsg.authorId === m.authorId &&
      Math.abs(m.tMinutes - lastMsg.tMinutes) <= gapMin
    ) {
      last.push(m);
    } else {
      out.push([m]);
    }
  }
  return out;
}

/** Deterministic pseudo-waveform (bar heights 0..1) from a seed id, for voice notes. */
export function voiceWaveform(seed: string, bars = 24): number[] {
  const out: number[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < bars; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    out.push(0.15 + ((h >>> 8) % 1000) / 1000 * 0.85);
  }
  return out;
}

/** Whether a text matches any highlight/keyword (case-insensitive whole-substring). */
export function highlightHit(text: string, words: string[]): boolean {
  const t = text.toLowerCase();
  return words.some((w) => w.trim() && t.includes(w.trim().toLowerCase()));
}

/** Resolve a community's member channels (group-of-groups), preserving order. */
export function communityChannels(community: Community, channels: Channel[]): Channel[] {
  return community.channelIds
    .map((id) => channels.find((c) => c.id === id))
    .filter((c): c is Channel => Boolean(c));
}

/** Sort weight for Teams message priority (urgent highest). */
export function priorityRank(p: MessagePriority | undefined): number {
  return p === "urgent" ? 2 : p === "important" ? 1 : 0;
}

export type RewriteTone = "professional" | "friendly" | "concise";

const FILLERS = ["um", "uh", "just", "really", "very", "actually", "basically", "kind of", "sort of"];

/**
 * Copilot-style message rewrite (Teams parity). Deterministic, locale-neutral
 * transforms over the user's draft — no external model in the mock.
 */
export function rewriteMessage(text: string, tone: RewriteTone): string {
  const base = text.trim().replace(/\s+/g, " ");
  if (!base) return base;
  if (tone === "concise") {
    const re = new RegExp(`\\b(${FILLERS.join("|")})\\b`, "gi");
    return base.replace(re, "").replace(/\s+/g, " ").trim();
  }
  const capped = base.charAt(0).toUpperCase() + base.slice(1);
  if (tone === "friendly") {
    return /[!?]$/.test(capped) ? capped : `${capped.replace(/\.$/, "")}!`;
  }
  // professional
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
}

export interface UrgentSchedule {
  /** Still inside the re-notification window and not yet read. */
  active: boolean;
  /** How many pings have fired so far (capped at the max). */
  repeats: number;
  /** Minutes until the next ping, or null when the window has closed. */
  nextInMin: number | null;
}

/**
 * Teams "urgent" re-notifies every `everyMin` for up to `windowMin` until read.
 * Given when it was sent and now (minutes), report ping count + next ping.
 */
export function urgentRepeatSchedule(
  sentMin: number,
  nowMin: number,
  read = false,
  everyMin = 2,
  windowMin = 20,
): UrgentSchedule {
  const elapsed = Math.max(0, nowMin - sentMin);
  const maxRepeats = Math.floor(windowMin / everyMin);
  if (read || elapsed >= windowMin) {
    return { active: false, repeats: Math.min(maxRepeats, Math.floor(elapsed / everyMin)), nextInMin: null };
  }
  const repeats = Math.floor(elapsed / everyMin);
  const nextInMin = (repeats + 1) * everyMin - elapsed;
  return { active: true, repeats, nextInMin };
}
