import { describe, it, expect } from "vitest";
import { capArray } from "@/lib/capArray";

describe("capArray (memory-bloat guard — gemini §3.1)", () => {
  it("keeps the most recent items past the cap", () => {
    expect(capArray([1, 2, 3, 4, 5], 3)).toEqual([3, 4, 5]);
  });
  it("returns the same reference when within bounds", () => {
    const a = [1, 2];
    expect(capArray(a, 5)).toBe(a);
  });
});
