import type { AppEvent, QnaItem, RegApproval, RegField, Registration } from "./types";

/** Pure Webinar-domain helpers — framework-free, unit-testable. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegValidation {
  ok: boolean;
  errors: Record<string, string>; // field id → "required" | "email"
}

/** Validate registration field values (required + email format). */
export function validateRegistration(fields: RegField[], values: Record<string, string>): RegValidation {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const v = (values[f.id] ?? "").trim();
    if (f.required && !v) {
      errors[f.id] = "required";
      continue;
    }
    if (f.type === "email" && v && !EMAIL.test(v)) errors[f.id] = "email";
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

export interface SimulivePosition {
  elapsedSec: number;
  pct: number; // 0..100
  live: boolean;
}

/** Where simulive/live playback sits on its timeline ("as-live"). */
export function simulivePosition(startedAtMs: number, nowMs: number, durationSec: number): SimulivePosition {
  const raw = Math.floor((nowMs - startedAtMs) / 1000);
  const elapsedSec = Math.max(0, Math.min(raw, durationSec));
  const pct = durationSec > 0 ? Math.round((elapsedSec / durationSec) * 100) : 0;
  const live = nowMs >= startedAtMs && raw < durationSec;
  return { elapsedSec, pct, live };
}

export interface AttendeeSegments {
  registered: number;
  attended: number;
  noShow: number;
  showRate: number; // 0..1
}

/** Registration → attendance funnel (no-show segmentation). */
export function segmentAttendees(regs: Registration[]): AttendeeSegments {
  const registered = regs.length;
  const attended = regs.filter((r) => r.status === "attended").length;
  const noShow = regs.filter((r) => r.status === "no_show").length;
  return { registered, attended, noShow, showRate: registered ? attended / registered : 0 };
}

/** Sort Q&A by upvotes (desc), ties broken by earlier timestamp. */
export function sortQna(items: QnaItem[]): QnaItem[] {
  return items.slice().sort((a, b) => b.upvotes.length - a.upvotes.length || a.tSec - b.tSec);
}

export type EventStatus = "upcoming" | "live" | "ended";

/** Live status from schedule + duration. */
export function eventStatus(startsAt: number, durationSec: number, now: number = Date.now()): EventStatus {
  if (now < startsAt) return "upcoming";
  if (now < startsAt + durationSec * 1000) return "live";
  return "ended";
}

/* ───────────── Town hall capacity + approval/waitlist (Teams parity) ───────────── */

export interface CapacityTier {
  used: number;
  limit: number;
  full: boolean;
}

export interface EventCapacity {
  interactive: CapacityTier;
  /** Present only for town halls with a view-only overflow tier. */
  viewOnly?: CapacityTier;
  waitlisted: number;
  pending: number;
}

const approvalOf = (r: Registration): RegApproval => r.approval ?? "approved";

/** Compute interactive / view-only / waitlist usage for an event. */
export function registrationCapacity(event: AppEvent, regs: Registration[]): EventCapacity {
  const mine = regs.filter((r) => r.eventId === event.id);
  const interactiveUsed = mine.filter((r) => approvalOf(r) === "approved").length;
  const waitlisted = mine.filter((r) => approvalOf(r) === "waitlisted").length;
  const pending = mine.filter((r) => approvalOf(r) === "pending").length;
  const capacity: EventCapacity = {
    interactive: { used: interactiveUsed, limit: event.capacity, full: interactiveUsed >= event.capacity },
    waitlisted,
    pending,
  };
  if (event.viewOnlyCapacity && event.viewOnlyCapacity > 0) {
    const overflow = Math.max(0, interactiveUsed - event.capacity);
    capacity.viewOnly = { used: Math.min(overflow, event.viewOnlyCapacity), limit: event.viewOnlyCapacity, full: overflow >= event.viewOnlyCapacity };
  }
  return capacity;
}

/**
 * Decide the approval state a *new* registration should get:
 * - approval required → "pending"
 * - interactive full  → "waitlisted"
 * - otherwise         → "approved"
 */
export function nextApproval(event: AppEvent, regs: Registration[]): RegApproval {
  if (event.requireApproval) return "pending";
  return registrationCapacity(event, regs).interactive.full ? "waitlisted" : "approved";
}

/** Oldest waitlisted registration to promote when a seat frees up (FIFO). */
export function admitFromWaitlist(regs: Registration[]): Registration | null {
  return regs.find((r) => r.approval === "waitlisted") ?? null;
}
