import { describe, it, expect, beforeAll } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import i18n from "@/i18n";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { matchPrompt, buildBlock, toggleItem, blockProgress, docCounts } from "@/features/canvas/canvas";
import { CANVAS_PROMPTS, CANVAS_DOC } from "@/features/canvas/data";
import { useCanvasStore } from "@/features/canvas/store";
import { AiCanvasPage } from "@/features/canvas/CanvasPage";

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});

const wrap = (ui: ReactNode) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>{ui}</MemoryRouter>
  </QueryClientProvider>
);

describe("AI Canvas (F2) — pure util", () => {
  it("matchPrompt selects by keyword overlap (or null)", () => {
    expect(matchPrompt("summarize the week", CANVAS_PROMPTS)?.id).toBe("p_summary");
    expect(matchPrompt("extract action items", CANVAS_PROMPTS)?.id).toBe("p_actions");
    expect(matchPrompt("zzz nothing here", CANVAS_PROMPTS)).toBeNull();
  });

  it("buildBlock produces kind-appropriate content", () => {
    const checklist = CANVAS_PROMPTS.find((p) => p.kind === "checklist")!;
    expect(buildBlock(checklist, 1).items?.length).toBeGreaterThan(0);
    const metrics = CANVAS_PROMPTS.find((p) => p.kind === "metrics")!;
    expect(buildBlock(metrics, 2).metrics?.length).toBeGreaterThan(0);
  });

  it("toggleItem + blockProgress compute completion", () => {
    const actions = CANVAS_DOC.blocks.find((b) => b.kind === "actions")!;
    expect(blockProgress(actions)).toBeCloseTo(1 / 3, 5);
    const toggled = toggleItem(actions, "ci_1");
    expect(toggled.items!.find((i) => i.id === "ci_1")!.done).toBe(true);
    // original is unchanged (immutability)
    expect(actions.items!.find((i) => i.id === "ci_1")!.done).toBe(false);
  });

  it("docCounts tallies blocks by kind", () => {
    const c = docCounts(CANVAS_DOC);
    expect(c.summary).toBe(1);
    expect(c.actions).toBe(1);
    expect(c.metrics).toBe(0);
  });
});

describe("AI Canvas — page render", () => {
  it("shows the doc title, a suggestion and a seeded block", () => {
    render(wrap(<AiCanvasPage />));
    expect(screen.getByText("Workspace pulse")).toBeTruthy();
    expect(screen.getByText("Summarize this week across the workspace")).toBeTruthy();
    expect(screen.getByText("This week, synthesized")).toBeTruthy();
  });
});

describe("AI Canvas — store", () => {
  it("runPrompt prepends a generated block", () => {
    const before = useCanvasStore.getState().doc.blocks.length;
    useCanvasStore.getState().runPrompt("show the kpi metrics");
    const blocks = useCanvasStore.getState().doc.blocks;
    expect(blocks.length).toBe(before + 1);
    expect(blocks[0].kind).toBe("metrics");
  });

  it("runPromptId, togglePin, toggleItem, moveBlock, removeBlock, clear", () => {
    useCanvasStore.getState().runPromptId("p_checklist");
    const top = useCanvasStore.getState().doc.blocks[0];
    expect(top.kind).toBe("checklist");

    useCanvasStore.getState().togglePin(top.id);
    expect(useCanvasStore.getState().doc.blocks.find((b) => b.id === top.id)!.pinned).toBe(true);

    const item = top.items![0];
    useCanvasStore.getState().toggleItem(top.id, item.id);
    expect(
      useCanvasStore.getState().doc.blocks.find((b) => b.id === top.id)!.items!.find((i) => i.id === item.id)!.done,
    ).toBe(true);

    const len = useCanvasStore.getState().doc.blocks.length;
    useCanvasStore.getState().moveBlock(top.id, "down");
    expect(useCanvasStore.getState().doc.blocks[0].id).not.toBe(top.id);
    expect(useCanvasStore.getState().doc.blocks.length).toBe(len);

    useCanvasStore.getState().removeBlock(top.id);
    expect(useCanvasStore.getState().doc.blocks.find((b) => b.id === top.id)).toBeUndefined();

    useCanvasStore.getState().clear();
    expect(useCanvasStore.getState().doc.blocks.length).toBe(0);
  });
});
