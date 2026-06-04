import { describe, it, expect } from "vitest";
import { useUIStore } from "@/store/uiStore";

describe("uiStore defaults", () => {
  it("starts with the copilot dock closed (no persistent panel / repeated greeting)", () => {
    expect(useUIStore.getState().copilotOpen).toBe(false);
  });

  it("can open the dock on demand", () => {
    useUIStore.getState().setCopilotOpen(true);
    expect(useUIStore.getState().copilotOpen).toBe(true);
    useUIStore.getState().setCopilotOpen(false);
  });
});
