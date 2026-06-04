import { LIVE_FEED } from "./data";
import type { IntelEvent } from "./types";

/**
 * Mock of the FastAPI SSE stream (`caption.*` / `translation.*` / `intel.*`).
 *
 * `intelEventGroupsFor` / `intelEventsFor` are pure (timer-free) so they unit-test
 * deterministically. `subscribeIntel` drives them over an interval and returns an
 * unsubscribe fn — swap its body for `new EventSource(url)` +
 * `es.addEventListener("caption"|"translation"|"intel", …)` with zero consumer change.
 */

/** Ordered typed events grouped per live-feed item (one group emitted per tick). */
export function intelEventGroupsFor(sourceId: string): IntelEvent[][] {
  const feed = LIVE_FEED[sourceId] ?? [];
  return feed.map((item) => {
    const group: IntelEvent[] = [
      { type: "caption.emitted", sourceId, segment: item.seg },
      { type: "translation.ready", sourceId, segmentId: item.seg.id, lang: "tr", text: item.seg.tr },
      { type: "intel.sentiment", sourceId, point: item.point },
    ];
    if (item.cue) group.push({ type: "intel.coaching", sourceId, cue: item.cue });
    if (item.highlight) group.push({ type: "intel.highlight", sourceId, highlight: item.highlight });
    return group;
  });
}

/** Flattened ordered event sequence for a source. */
export function intelEventsFor(sourceId: string): IntelEvent[] {
  return intelEventGroupsFor(sourceId).flat();
}

export interface SubscribeOpts {
  /** Tick interval in ms (default 2600). */
  intervalMs?: number;
  /** Called once the feed is exhausted. */
  onComplete?: () => void;
}

/**
 * Subscribe to the simulated live stream. Emits one feed item's event group per
 * tick, in order, then completes. Returns an unsubscribe function.
 */
export function subscribeIntel(
  sourceId: string,
  onEvent: (e: IntelEvent) => void,
  opts: SubscribeOpts = {},
): () => void {
  const intervalMs = opts.intervalMs ?? 2600;
  const groups = intelEventGroupsFor(sourceId);
  let i = 0;
  const id = setInterval(() => {
    if (i >= groups.length) {
      clearInterval(id);
      opts.onComplete?.();
      return;
    }
    for (const e of groups[i]) onEvent(e);
    i += 1;
  }, intervalMs);
  return () => clearInterval(id);
}
