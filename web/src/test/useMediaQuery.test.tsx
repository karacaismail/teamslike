import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useIsMobile } from "@/lib/useMediaQuery";

function Probe() {
  return <span>{useIsMobile() ? "mobile" : "desktop"}</span>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useIsMobile", () => {
  it("falls back to desktop when matchMedia is unavailable", () => {
    render(<Probe />);
    expect(screen.getByText("desktop")).toBeTruthy();
  });

  it("reports mobile when the media query matches", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: true,
      media: q,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
    render(<Probe />);
    expect(screen.getByText("mobile")).toBeTruthy();
  });
});
