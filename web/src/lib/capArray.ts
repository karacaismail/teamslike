/**
 * Keep only the most recent `max` items of an append-only (oldest-first) array
 * — a memory-bloat guard for streaming stores (gemini §3.1). Live captions,
 * sentiment points, coaching cues etc. would otherwise grow unbounded for the
 * whole session. Returns the same reference when already within bounds.
 */
export function capArray<T>(arr: T[], max: number): T[] {
  return arr.length > max ? arr.slice(arr.length - max) : arr;
}
