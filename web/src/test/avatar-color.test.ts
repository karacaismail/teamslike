import { describe, it, expect } from "vitest";
import { avatarColor, AVATAR_PALETTE } from "@/lib/avatarColor";

describe("avatarColor", () => {
  it("is deterministic for a given name", () => {
    expect(avatarColor("Defne Yıldız")).toBe(avatarColor("Defne Yıldız"));
  });

  it("always returns a colour from the palette", () => {
    for (const n of ["Ismail K.", "Marco Rossi", "x", ""]) {
      expect(AVATAR_PALETTE).toContain(avatarColor(n));
    }
  });

  it("spreads a typical team across more than one colour", () => {
    const team = ["Ismail K.", "Defne Yıldız", "Marco Rossi", "Aylin Çetin", "Tom Becker", "Sara Lindqvist"];
    const colours = new Set(team.map(avatarColor));
    expect(colours.size).toBeGreaterThan(1);
  });
});
