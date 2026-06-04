import { create } from "zustand";
import {
  ADHERENCE,
  QA_EVALUATIONS,
  SCORECARD,
  SHIFTS,
  STAFFING,
  WFO_AHT_SEC,
  WFO_INTERVAL_SEC,
  WFO_OCCUPANCY,
} from "./data";
import { requiredAgents } from "./wfo";
import type { AdherenceRow, QaEvaluation, ScorecardCriterion, Shift, StaffingInterval } from "./types";

let evalSeq = 0;

const recompute = (i: StaffingInterval): StaffingInterval => ({
  ...i,
  required: requiredAgents(i.forecastVolume, WFO_AHT_SEC, WFO_INTERVAL_SEC, WFO_OCCUPANCY),
});

interface WfoState {
  intervals: StaffingInterval[];
  shifts: Shift[];
  adherence: AdherenceRow[];
  criteria: ScorecardCriterion[];
  evaluations: QaEvaluation[];

  /** Recompute required-agents for every interval from current volume. */
  regenerateForecast: () => void;
  setVolume: (id: string, volume: number) => void;
  /** Self-healing intraday: add one agent to an understaffed interval. */
  bumpScheduled: (id: string) => void;
  addEvaluation: (agentId: string, conversationId: string, scores: Record<string, number>) => void;
}

export const useWfoStore = create<WfoState>((set) => ({
  intervals: STAFFING.map(recompute),
  shifts: SHIFTS.map((s) => ({ ...s })),
  adherence: ADHERENCE.map((a) => ({ ...a })),
  criteria: SCORECARD.map((c) => ({ ...c })),
  evaluations: QA_EVALUATIONS.map((e) => ({ ...e, scores: { ...e.scores } })),

  regenerateForecast: () => set((s) => ({ intervals: s.intervals.map(recompute) })),
  setVolume: (id, volume) =>
    set((s) => ({
      intervals: s.intervals.map((i) => (i.id === id ? recompute({ ...i, forecastVolume: Math.max(0, volume) }) : i)),
    })),
  bumpScheduled: (id) =>
    set((s) => ({
      intervals: s.intervals.map((i) => (i.id === id ? { ...i, scheduled: i.scheduled + 1 } : i)),
    })),
  addEvaluation: (agentId, conversationId, scores) =>
    set((s) => ({
      evaluations: [...s.evaluations, { id: `qa_new_${++evalSeq}`, agentId, conversationId, scores: { ...scores } }],
    })),
}));
