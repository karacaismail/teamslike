import { create } from "zustand";
import { CALL_HISTORY, LINES, ROUTING_RULES } from "./data";
import { normalizeNumber } from "./routing";
import type {
  Call,
  CallEndReason,
  CallEvent,
  Disposition,
  MonitorMode,
  PhoneLine,
  Recording,
  RoutingRule,
} from "./types";

let seq = 0;
const newId = () => `call_${Date.now()}_${seq++}`;

interface CallState {
  activeCall: Call | null;
  history: Call[];
  lines: PhoneLine[];
  rules: RoutingRule[];
  muted: boolean;
  /** Whether music-on-hold plays to the held party (PBX setting). */
  holdMusic: boolean;
  /** Calls parked for pickup. */
  parkedCalls: Call[];
  /** Recordings captured this session. */
  recordings: Recording[];
  /** Warm-transfer consult leg, if any. */
  consult: { to: string } | null;
  /** Supervisor monitor mode on the active call. */
  monitor: MonitorMode | null;
  /** Ended call awaiting an after-call disposition. */
  pendingWrapUp: Call | null;
  /** Saved call dispositions (wrap-up). */
  dispositions: Disposition[];
  /** Blocked numbers (spam control). */
  blocklist: string[];

  place: (to: string) => void;
  simulateInbound: (from: string) => void;
  answer: () => void;
  hold: () => void;
  resume: () => void;
  transfer: (to: string) => void;
  hangup: (reason?: CallEndReason) => void;
  toggleMute: () => void;
  /** Toggle the music-on-hold PBX setting. */
  toggleHoldMusic: () => void;
  /** 1-second duration tick (driven by ActiveCallBar). */
  tick: () => void;
  /** Apply one typed WS event to the state machine (idempotent). */
  applyEvent: (evt: CallEvent) => void;

  // P0 call controls
  park: () => void;
  pickup: (id: string) => void;
  sendDtmf: (digit: string) => void;
  toggleRecording: () => void;
  /** Conference: merge an extra remote leg into the active call. */
  addToCall: (e164: string) => void;
  /** Warm transfer: hold the call and dial a consult leg. */
  startConsult: (to: string) => void;
  /** Hand the call off to the consult party and drop your leg. */
  completeTransfer: () => void;
  /** Merge the consult leg into the call (3-way conference). */
  mergeConsult: () => void;
  /** Abandon the consult and resume the original call. */
  cancelConsult: () => void;

  // P1 supervisor / wrap-up / spam
  setMonitor: (mode: MonitorMode) => void;
  stopMonitor: () => void;
  saveDisposition: (d: Disposition) => void;
  dismissWrapUp: () => void;
  blockNumber: (e164: string) => void;
  unblock: (e164: string) => void;

  reset: () => void;
}

const PRIMARY_LINE = LINES[0];

function endCurrent(activeCall: Call | null, history: Call[], reason: CallEndReason) {
  if (!activeCall) return { activeCall: null, history };
  const ended: Call = { ...activeCall, state: "ended", endReason: reason };
  return { activeCall: null, history: [ended, ...history].slice(0, 100) };
}

export const useCallStore = create<CallState>((set, get) => ({
  activeCall: null,
  history: [...CALL_HISTORY],
  lines: LINES,
  rules: ROUTING_RULES,
  muted: false,
  holdMusic: true,
  parkedCalls: [],
  recordings: [],
  consult: null,
  monitor: null,
  pendingWrapUp: null,
  dispositions: [],
  blocklist: [],

  place: (to) =>
    set({
      muted: false,
      activeCall: {
        id: newId(),
        lineId: PRIMARY_LINE.id,
        direction: "outbound",
        from: PRIMARY_LINE.e164,
        to: normalizeNumber(to),
        state: "ringing",
        startedAt: Date.now(),
        durationSec: 0,
      },
    }),

  simulateInbound: (from) =>
    set({
      muted: false,
      activeCall: {
        id: newId(),
        lineId: PRIMARY_LINE.id,
        direction: "inbound",
        from: normalizeNumber(from),
        to: PRIMARY_LINE.e164,
        state: "ringing",
        startedAt: Date.now(),
        durationSec: 0,
      },
    }),

  answer: () =>
    set((s) => (s.activeCall ? { activeCall: { ...s.activeCall, state: "active" } } : {})),

  hold: () =>
    set((s) =>
      s.activeCall && s.activeCall.state === "active"
        ? { activeCall: { ...s.activeCall, state: "hold" } }
        : {},
    ),

  resume: () =>
    set((s) =>
      s.activeCall && s.activeCall.state === "hold"
        ? { activeCall: { ...s.activeCall, state: "active" } }
        : {},
    ),

  transfer: () => set((s) => endCurrent(s.activeCall, s.history, "completed")),

  hangup: (reason = "completed") =>
    set((s) =>
      s.activeCall
        ? { ...endCurrent(s.activeCall, s.history, reason), pendingWrapUp: s.activeCall, monitor: null }
        : {},
    ),

  toggleMute: () => set((s) => ({ muted: !s.muted })),

  toggleHoldMusic: () => set((s) => ({ holdMusic: !s.holdMusic })),

  tick: () =>
    set((s) =>
      s.activeCall && s.activeCall.state !== "ended"
        ? { activeCall: { ...s.activeCall, durationSec: s.activeCall.durationSec + 1 } }
        : {},
    ),

  applyEvent: (evt) =>
    set((s) => {
      switch (evt.type) {
        case "call.placed":
          if (s.activeCall?.id === evt.call.id) return {}; // idempotent
          return { activeCall: evt.call };
        case "call.answered":
          return s.activeCall && s.activeCall.id === evt.callId
            ? { activeCall: { ...s.activeCall, state: "active" } }
            : {};
        case "call.ended":
          return s.activeCall && s.activeCall.id === evt.callId
            ? endCurrent(s.activeCall, s.history, evt.reason)
            : {};
        case "call.routed":
        case "voicemail.left":
        case "sms.received":
          return {}; // handled elsewhere / no call-state effect
        default:
          return {};
      }
    }),

  park: () =>
    set((s) =>
      s.activeCall
        ? { activeCall: null, parkedCalls: [...s.parkedCalls, { ...s.activeCall, state: "hold" }] }
        : {},
    ),

  pickup: (id) =>
    set((s) => {
      const parked = s.parkedCalls.find((c) => c.id === id);
      if (!parked) return {};
      return {
        activeCall: { ...parked, state: "active" },
        parkedCalls: s.parkedCalls.filter((c) => c.id !== id),
      };
    }),

  sendDtmf: (digit) =>
    set((s) =>
      s.activeCall ? { activeCall: { ...s.activeCall, dtmf: (s.activeCall.dtmf ?? "") + digit } } : {},
    ),

  toggleRecording: () =>
    set((s) => {
      if (!s.activeCall) return {};
      const on = !s.activeCall.recording;
      const recordings = on
        ? [
            ...s.recordings,
            { id: newId(), callId: s.activeCall.id, startedAt: Date.now(), durationSec: 0, consent: true },
          ]
        : s.recordings;
      return { activeCall: { ...s.activeCall, recording: on }, recordings };
    }),

  addToCall: (e164) =>
    set((s) =>
      s.activeCall
        ? { activeCall: { ...s.activeCall, participants: [...(s.activeCall.participants ?? []), normalizeNumber(e164)] } }
        : {},
    ),

  startConsult: (to) =>
    set((s) =>
      s.activeCall
        ? { consult: { to: normalizeNumber(to) }, activeCall: { ...s.activeCall, state: "hold" } }
        : {},
    ),

  completeTransfer: () =>
    set((s) => {
      if (!s.activeCall) return { consult: null };
      return { ...endCurrent(s.activeCall, s.history, "completed"), consult: null };
    }),

  mergeConsult: () =>
    set((s) => {
      if (!s.activeCall || !s.consult) return {};
      return {
        activeCall: {
          ...s.activeCall,
          state: "active",
          participants: [...(s.activeCall.participants ?? []), s.consult.to],
        },
        consult: null,
      };
    }),

  cancelConsult: () =>
    set((s) => (s.activeCall ? { activeCall: { ...s.activeCall, state: "active" }, consult: null } : { consult: null })),

  setMonitor: (mode) => set({ monitor: mode }),
  stopMonitor: () => set({ monitor: null }),

  saveDisposition: (d) => set((s) => ({ dispositions: [d, ...s.dispositions], pendingWrapUp: null })),
  dismissWrapUp: () => set({ pendingWrapUp: null }),

  blockNumber: (e164) => set((s) => (s.blocklist.includes(e164) ? {} : { blocklist: [...s.blocklist, e164] })),
  unblock: (e164) => set((s) => ({ blocklist: s.blocklist.filter((x) => x !== e164) })),

  reset: () =>
    set({
      activeCall: null,
      history: [...CALL_HISTORY],
      muted: false,
      holdMusic: true,
      parkedCalls: [],
      recordings: [],
      consult: null,
      monitor: null,
      pendingWrapUp: null,
      dispositions: [],
      blocklist: [],
    }),
}));
