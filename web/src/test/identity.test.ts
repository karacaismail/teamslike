import { describe, it, expect } from "vitest";
import { memberById, memberName, presenceOf } from "@/lib/identity";
import { memberName as messagingReexport } from "@/features/messaging/members";
import { TEAM } from "@/data/team";

/**
 * Identity is a platform-level read model (lib/identity), not owned by any
 * bounded context. Messaging now re-exports it for back-compat. (A1)
 */
describe("lib/identity (platform identity accessor)", () => {
  it("memberName resolves a known member from the Tenancy seed", () => {
    expect(memberName("usr_1")).toBe(TEAM[0].name);
    expect(memberName("usr_2")).toBe("Defne Yıldız");
  });

  it("memberName falls back to the id for unknown members", () => {
    expect(memberName("usr_999")).toBe("usr_999");
  });

  it("memberById returns the member or undefined", () => {
    expect(memberById("usr_1")?.email).toBe("ismail@aura.dev");
    expect(memberById("nope")).toBeUndefined();
  });

  it("presenceOf reads presence from the seed", () => {
    expect(presenceOf("usr_1")).toBe(TEAM[0].presence);
  });

  it("messaging/members re-export points at the same platform accessor", () => {
    expect(messagingReexport("usr_1")).toBe(memberName("usr_1"));
  });
});
