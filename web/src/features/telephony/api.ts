import { CALL_HISTORY, LINES, SMS_THREADS, VOICEMAILS } from "./data";
import { normalizeNumber } from "./routing";
import type { Call, CallState, PhoneLine, SmsThread, Voicemail } from "./types";

/**
 * Mocks of the carrier-agnostic FastAPI contract. Each function mirrors a REST
 * endpoint; swapping these for an OpenAPI-typed httpClient leaves the UI/stores
 * unchanged. Call-state changes additionally arrive over WS `call.*`.
 */
const delay = <T>(value: T, ms = 150): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/** GET /lines */
export function fetchLines(): Promise<PhoneLine[]> {
  return delay(LINES);
}

/** GET /calls — call log. */
export function fetchCalls(): Promise<Call[]> {
  return delay(CALL_HISTORY);
}

/** GET /voicemails */
export function fetchVoicemails(): Promise<Voicemail[]> {
  return delay(VOICEMAILS);
}

/** GET /sms — threads. */
export function fetchSmsThreads(): Promise<SmsThread[]> {
  return delay(SMS_THREADS);
}

/** POST /calls — place an outbound call. */
export function placeCall(to: string, lineId = LINES[0].id): Promise<Call> {
  return delay({
    id: `call_${Date.now()}`,
    lineId,
    direction: "outbound",
    from: LINES[0].e164,
    to: normalizeNumber(to),
    state: "ringing",
    startedAt: Date.now(),
    durationSec: 0,
  });
}

/** PATCH /calls/:id — hold / resume / transfer (state transition echo). */
export function patchCall(id: string, state: CallState): Promise<{ id: string; state: CallState }> {
  return delay({ id, state });
}
