import type { ScorecardCriterion, StaffingInterval } from "./types";

/**
 * Pure WFO/WEM helpers (staffing, adherence, quality scoring).
 * Framework-free → unit-testable. A real backend would use full Erlang-C; this
 * uses a transparent occupancy-based approximation suitable for the demo.
 */

/** Agents needed ≈ ceil(volume × AHT ÷ (interval × target occupancy)). */
export function requiredAgents(
  volume: number,
  ahtSec: number,
  intervalSec: number,
  occupancy = 0.85,
): number {
  if (volume <= 0 || intervalSec <= 0 || occupancy <= 0) return 0;
  return Math.ceil((volume * ahtSec) / (intervalSec * occupancy));
}

/** Scheduled − required (negative = understaffed). */
export function staffingGap(interval: StaffingInterval): number {
  return interval.scheduled - interval.required;
}

/** Adherence ratio 0..1 = on-schedule minutes ÷ scheduled minutes (capped). */
export function adherence(scheduledMin: number, adherentMin: number): number {
  if (scheduledMin <= 0) return 0;
  return Math.min(adherentMin, scheduledMin) / scheduledMin;
}

/** Weighted scorecard total normalized to 0..100 (each criterion scored 0..5). */
export function scorecardTotal(
  scores: Record<string, number>,
  criteria: ScorecardCriterion[],
): number {
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
  if (totalWeight <= 0) return 0;
  const earned = criteria.reduce((s, c) => s + ((scores[c.id] ?? 0) / 5) * c.weight, 0);
  return Math.round((earned / totalWeight) * 100);
}

/** Intervals where scheduled < required — self-healing intraday candidates. */
export function understaffed(intervals: StaffingInterval[]): StaffingInterval[] {
  return intervals.filter((i) => staffingGap(i) < 0);
}
