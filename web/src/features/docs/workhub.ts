import type { ApprovalRequest, FormDef, FormResponse, Shift } from "./types";

/**
 * Pure helpers for the Teams "apps" surfaces — Approvals, Shifts, Forms.
 * Framework-free → unit-testable; the backend would compute the same.
 */

export interface ApprovalSummary {
  pending: number;
  approved: number;
  rejected: number;
}

/** Count approvals by status. */
export function approvalSummary(requests: ApprovalRequest[]): ApprovalSummary {
  return {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };
}

/** Total scheduled hours for a user across the week (2 decimals). */
export function weeklyHours(shifts: Shift[], userId: string): number {
  const mins = shifts.filter((s) => s.userId === userId).reduce((n, s) => n + (s.endMin - s.startMin), 0);
  return Math.round((mins / 60) * 100) / 100;
}

/** Do two shifts overlap on the same day? */
export function shiftsOverlap(a: Shift, b: Shift): boolean {
  return a.day === b.day && a.startMin < b.endMin && b.startMin < a.endMin;
}

/** Whether a user has any overlapping shifts (double-booking). */
export function hasShiftConflict(shifts: Shift[], userId: string): boolean {
  const mine = shifts.filter((s) => s.userId === userId);
  for (let i = 0; i < mine.length; i++) {
    for (let j = i + 1; j < mine.length; j++) {
      if (shiftsOverlap(mine[i], mine[j])) return true;
    }
  }
  return false;
}

/** Open (unassigned) shifts available to claim. */
export function openShifts(shifts: Shift[]): Shift[] {
  return shifts.filter((s) => s.open || s.userId === "");
}

/** Tally form responses → option id → count (every option present, 0-filled). */
export function tallyResponses(form: FormDef, responses: FormResponse[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const o of form.options) counts[o.id] = 0;
  for (const r of responses) {
    if (r.formId === form.id && counts[r.optionId] !== undefined) counts[r.optionId]++;
  }
  return counts;
}
