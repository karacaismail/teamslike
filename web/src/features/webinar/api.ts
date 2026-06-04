import { EVENTS } from "./data";
import type { AppEvent, Poll, QnaItem, Registration } from "./types";

/**
 * Mocks of the FastAPI contract for the Webinar context. Swapping these for an
 * OpenAPI-typed httpClient leaves the UI/stores unchanged; live updates also
 * arrive over WS `event.*`.
 */
const delay = <T>(value: T, ms = 150): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/** GET /events */
export function fetchEvents(): Promise<AppEvent[]> {
  return delay(EVENTS);
}

/** GET /events/:id */
export function fetchEvent(id: string): Promise<AppEvent | undefined> {
  return delay(EVENTS.find((e) => e.id === id));
}

/** POST /registrations */
export function submitRegistration(eventId: string, values: Record<string, string>): Promise<Registration> {
  return delay({ id: `rg_${Date.now()}`, eventId, values, status: "registered" });
}

/** POST /polls */
export function createPoll(eventId: string, question: string, options: string[]): Promise<Poll> {
  return delay({
    id: `pl_${Date.now()}`,
    eventId,
    question,
    state: "live",
    options: options.map((t, i) => ({ id: `o${i + 1}`, text: t, votes: [] })),
  });
}

/** POST /qna */
export function createQna(eventId: string, authorId: string, text: string): Promise<QnaItem> {
  return delay({ id: `q_${Date.now()}`, eventId, authorId, text, upvotes: [], answered: false, tSec: 0 });
}

/** POST /qna/:id/upvote */
export function upvoteQna(id: string): Promise<{ id: string }> {
  return delay({ id });
}
