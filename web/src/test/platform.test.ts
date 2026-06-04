import { describe, it, expect } from "vitest";
import { searchAll, registerSearchProvider } from "@/lib/search";
import { presenceSummary, subscribePresence, presenceOf } from "@/lib/presence";
import { TEAM } from "@/data/team";

describe("global search service (A2)", () => {
  it("finds members by name and deep-links to them", () => {
    const r = searchAll("ismail");
    expect(r.some((x) => x.kind === "member" && x.href === "/members")).toBe(true);
  });
  it("finds domains by key", () => {
    const r = searchAll("messaging");
    expect(r.some((x) => x.kind === "domain" && x.href === "/messaging")).toBe(true);
  });
  it("returns nothing for a blank query", () => {
    expect(searchAll("   ")).toEqual([]);
  });
  it("includes results contributed by registered providers (IoC)", () => {
    registerSearchProvider((q) => (q.includes("zzq") ? [{ id: "p1", kind: "clip", title: "zzq", href: "/docs" }] : []));
    expect(searchAll("zzq").some((x) => x.id === "p1")).toBe(true);
  });
});

describe("presence service (A2)", () => {
  it("summarizes presence across the team", () => {
    const s = presenceSummary();
    expect(s.online + s.away + s.offline).toBe(TEAM.length);
  });
  it("reads a single member's presence", () => {
    expect(presenceOf("usr_1")).toBe(TEAM[0].presence);
  });
  it("delivers a presence snapshot to subscribers", () => {
    let snap: Record<string, string> = {};
    const off = subscribePresence((s) => (snap = s));
    expect(snap["usr_1"]).toBe(TEAM[0].presence);
    off();
  });
});
