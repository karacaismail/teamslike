import type { Call } from "./types";

/** Aggregate call-log metrics (the Power-Pack / Call-Quality-Dashboard analog). */
export interface CallStats {
  total: number;
  inbound: number;
  outbound: number;
  missed: number;
  missedRate: number; // 0..1
  avgHandleSec: number;
  recorded: number;
}

export function computeCallStats(calls: Call[]): CallStats {
  const total = calls.length;
  const inbound = calls.filter((c) => c.direction === "inbound").length;
  const outbound = total - inbound;
  const missed = calls.filter((c) => c.endReason === "missed").length;
  const handled = calls.filter((c) => c.durationSec > 0);
  const avgHandleSec = handled.length
    ? Math.round(handled.reduce((n, c) => n + c.durationSec, 0) / handled.length)
    : 0;
  const recorded = calls.filter((c) => c.recordingId).length;
  return { total, inbound, outbound, missed, missedRate: total ? missed / total : 0, avgHandleSec, recorded };
}

export interface HourBucket {
  hour: number;
  count: number;
}

/** Call volume split into 24 hourly buckets (local time). */
export function volumeByHour(calls: Call[]): HourBucket[] {
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
  for (const c of calls) buckets[new Date(c.startedAt).getHours()].count += 1;
  return buckets;
}
