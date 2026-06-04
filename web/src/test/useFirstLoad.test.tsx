import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useFirstLoad } from "@/lib/useFirstLoad";

function Probe() {
  const loading = useFirstLoad();
  return <span>{loading ? "loading" : "ready"}</span>;
}

describe("useFirstLoad", () => {
  it("skips the skeleton flash under the test runner (instant ready)", () => {
    render(<Probe />);
    // Test mode → no transient "loading" state to race against.
    expect(screen.getByText("ready")).toBeTruthy();
    expect(screen.queryByText("loading")).toBeNull();
  });
});
