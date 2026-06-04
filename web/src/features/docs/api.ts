import { BOARD, CLIPS, DOCS, WORKFLOWS } from "./data";
import type { Board, Clip, Doc, Workflow } from "./types";

/**
 * Mocks of the Docs & Workspace FastAPI contract (`/docs`, `/boards`,
 * `/workflows`, `/clips`). Collab edits also stream over WS `doc.*`.
 */
const delay = <T>(value: T, ms = 120): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function fetchDocs(): Promise<Doc[]> {
  return delay(DOCS);
}
export function fetchBoard(): Promise<Board> {
  return delay(BOARD);
}
export function fetchWorkflows(): Promise<Workflow[]> {
  return delay(WORKFLOWS);
}
export function fetchClips(): Promise<Clip[]> {
  return delay(CLIPS);
}
