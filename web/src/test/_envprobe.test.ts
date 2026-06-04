import { describe, it, expect } from "vitest";

/**
 * Test-environment contract. Several runtime guards key off
 * `import.meta.env.MODE === "test"` — e.g. `useFirstLoad` returns instant-false
 * so component tests assert real content instead of racing a loading skeleton,
 * and the store memory caps stay deterministic. If Vitest ever stopped
 * reporting MODE as "test", those guards would silently misbehave; this locks
 * the contract.
 */
describe("test env contract", () => {
  it("reports import.meta.env.MODE as 'test'", () => {
    expect(import.meta.env.MODE).toBe("test");
  });
});
