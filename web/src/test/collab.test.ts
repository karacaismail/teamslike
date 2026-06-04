import { describe, it, expect } from "vitest";
import { commentsForDoc, openComments } from "@/features/docs/collab";
import type { DocComment } from "@/features/docs/types";

const cs: DocComment[] = [
  { id: "1", docId: "d1", blockId: "b1", authorId: "u", body: "x", atMin: 5 },
  { id: "2", docId: "d1", blockId: "b2", authorId: "u", body: "y", atMin: 3, resolved: true },
  { id: "3", docId: "d2", blockId: "b1", authorId: "u", body: "z", atMin: 1 },
];

describe("doc collaboration (Faz 9)", () => {
  it("commentsForDoc scopes to a doc", () => {
    expect(commentsForDoc(cs, "d1").map((c) => c.id)).toEqual(["1", "2"]);
  });
  it("openComments excludes resolved", () => {
    expect(openComments(cs, "d1").map((c) => c.id)).toEqual(["1"]);
  });
});
