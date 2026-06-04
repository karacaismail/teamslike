import type { DocComment } from "./types";

/**
 * Doc collaboration helpers (Faz 9). Pure → unit-tested directly. The
 * CommentSidebar renders these; a simulated "teammate edit" in the store stands
 * in for a real CRDT/OT peer until the realtime backend lands.
 */
export function commentsForDoc(comments: DocComment[], docId: string): DocComment[] {
  return comments.filter((c) => c.docId === docId);
}

export function openComments(comments: DocComment[], docId: string): DocComment[] {
  return commentsForDoc(comments, docId).filter((c) => !c.resolved);
}
