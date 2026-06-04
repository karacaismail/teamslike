import { CONTACTS, CONVERSATIONS, INBOXES, KB_ARTICLES } from "./data";
import { searchKb } from "./support";
import type { Contact, Conversation, Inbox, KbArticle } from "./types";

/**
 * Mocks of the Chatwoot-ACL FastAPI contract. Swapping for an OpenAPI-typed
 * httpClient leaves the UI/stores unchanged; live updates arrive over WS
 * `conversation.*`.
 */
const delay = <T>(value: T, ms = 150): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/** GET /conversations */
export function fetchConversations(): Promise<Conversation[]> {
  return delay(CONVERSATIONS);
}

/** GET /inboxes */
export function fetchInboxes(): Promise<Inbox[]> {
  return delay(INBOXES);
}

/** GET /contacts */
export function fetchContacts(): Promise<Contact[]> {
  return delay(CONTACTS);
}

/** GET /kb?q= */
export function searchKbRemote(q: string): Promise<KbArticle[]> {
  return delay(searchKb(KB_ARTICLES, q));
}

/**
 * POST /ai/suggest — Captain-style draft reply (human approves before sending).
 * Deterministic stub based on the last inbound message intent.
 */
export function aiSuggest(conversationId: string): Promise<string> {
  const conv = CONVERSATIONS.find((c) => c.id === conversationId);
  const lastIn = conv?.messages.filter((m) => m.direction === "in").at(-1);
  const text = lastIn?.body ?? "";
  const suggestion = /invoice|refund|billing|charge/i.test(text)
    ? "I've reviewed your billing and I'm applying a correction now — you'll get a confirmation by email shortly."
    : /error|500|broken|bug|crash/i.test(text)
      ? "Thanks for flagging this — I've reproduced it and escalated to engineering. I'll update you as soon as it's patched."
      : "Thanks for reaching out — happy to help. Could you share a little more detail so I can resolve this quickly?";
  return delay(suggestion);
}
