import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import i18n from "@/i18n";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { useDocsStore } from "@/features/docs/docsStore";
import { useWorkhubStore } from "@/features/docs/workhubStore";
import { toggleBlock, moveCard, runWorkflow, docProgress } from "@/features/docs/docs";
import {
  removeFillerWords,
  autoSummary,
  autoChapters,
  extractTasks,
  clipToDoc,
  clipToWorkItem,
  clipToMessage,
  isLinkExpired,
  reactionTotal,
  topClips,
} from "@/features/docs/clips";
import { CLIPS } from "@/features/docs/data";
import { ClipsList } from "@/features/docs/components/ClipsList";
import { approvalSummary, weeklyHours, hasShiftConflict, openShifts, tallyResponses } from "@/features/docs/workhub";
import { fetchDocs, fetchBoard } from "@/features/docs/api";
import { DOCS, BOARD, WORKFLOWS } from "@/features/docs/data";
import { DocsPage } from "@/features/docs/DocsPage";
import { KanbanBoard } from "@/features/docs/components/KanbanBoard";
import { AppsPanel } from "@/features/docs/components/AppsPanel";
import type { Shift, FormDef, FormResponse } from "@/features/docs/types";

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});

beforeEach(() => {
  useDocsStore.getState().reset();
  useWorkhubStore.getState().reset();
});

describe("docs util", () => {
  it("toggleBlock flips a todo block", () => {
    const blocks = toggleBlock(DOCS[0].blocks, "b5"); // unchecked → checked
    expect(blocks.find((b) => b.id === "b5")!.checked).toBe(true);
  });

  it("moveCard moves a card to another column", () => {
    const cards = moveCard(BOARD.cards, "cd2", "col_done");
    expect(cards.find((c) => c.id === "cd2")!.columnId).toBe("col_done");
  });

  it("runWorkflow returns a result per step (all done)", () => {
    const results = runWorkflow(WORKFLOWS.find((w) => w.id === "wf_onboard")!);
    expect(results).toHaveLength(3);
    expect(results.every((r) => r.status === "done")).toBe(true);
  });

  it("docProgress counts completed todos", () => {
    const p = docProgress(DOCS[0].blocks); // 2 of 3 todos done
    expect(p.done).toBe(2);
    expect(p.total).toBe(3);
    expect(p.pct).toBe(67);
  });
});

describe("docsStore", () => {
  it("toggleBlock updates the doc", () => {
    useDocsStore.getState().toggleBlock("doc_launch", "b5");
    const doc = useDocsStore.getState().docs.find((d) => d.id === "doc_launch")!;
    expect(doc.blocks.find((b) => b.id === "b5")!.checked).toBe(true);
  });

  it("moveCard updates the board", () => {
    useDocsStore.getState().moveCard("cd2", "col_done");
    expect(useDocsStore.getState().board.cards.find((c) => c.id === "cd2")!.columnId).toBe("col_done");
  });

  it("runWorkflow records the last run log", () => {
    useDocsStore.getState().runWorkflow("wf_onboard");
    expect(useDocsStore.getState().lastRun?.length).toBe(3);
  });

  it("editBlock + setActiveDoc are wired (CanvasEditor inline edit + doc switcher)", () => {
    useDocsStore.getState().editBlock("doc_launch", "b2", "Updated owner line");
    expect(useDocsStore.getState().docs.find((d) => d.id === "doc_launch")!.blocks.find((b) => b.id === "b2")!.content).toBe("Updated owner line");
    expect(useDocsStore.getState().docs.length).toBeGreaterThan(1);
    useDocsStore.getState().setActiveDoc("doc_onboarding");
    expect(useDocsStore.getState().activeDocId).toBe("doc_onboarding");
  });

  it("addClip appends a clip", () => {
    const before = useDocsStore.getState().clips.length;
    useDocsStore.getState().addClip("New clip", "usr_1");
    expect(useDocsStore.getState().clips.length).toBe(before + 1);
  });
});

describe("workhub apps util (Approvals · Shifts · Forms — Teams parity)", () => {
  const shifts: Shift[] = [
    { id: "a", userId: "u1", userName: "U1", day: 1, startMin: 540, endMin: 1020, role: "Support" },
    { id: "b", userId: "u1", userName: "U1", day: 1, startMin: 1000, endMin: 1200, role: "Support" }, // overlaps a
    { id: "c", userId: "", userName: "", day: 2, startMin: 540, endMin: 900, role: "Sales", open: true },
  ];

  it("approvalSummary counts by status", () => {
    const sum = approvalSummary([
      { id: "1", title: "x", requesterId: "r", approverId: "a", status: "pending", createdMin: 0 },
      { id: "2", title: "y", requesterId: "r", approverId: "a", status: "approved", createdMin: 0 },
      { id: "3", title: "z", requesterId: "r", approverId: "a", status: "pending", createdMin: 0 },
    ]);
    expect(sum).toMatchObject({ pending: 2, approved: 1, rejected: 0 });
  });

  it("weeklyHours sums a user's shift minutes; hasShiftConflict detects overlap", () => {
    expect(weeklyHours(shifts, "u1")).toBeCloseTo(8 + 3.33, 1); // 9-17 + overlap leg
    expect(hasShiftConflict(shifts, "u1")).toBe(true);
    expect(openShifts(shifts).map((s) => s.id)).toEqual(["c"]);
  });

  it("tallyResponses tallies every option (0-filled)", () => {
    const form: FormDef = { id: "f", title: "t", question: "q", options: [{ id: "o1", text: "A" }, { id: "o2", text: "B" }] };
    const responses: FormResponse[] = [
      { id: "1", formId: "f", optionId: "o1", responderId: "x" },
      { id: "2", formId: "f", optionId: "o1", responderId: "y" },
    ];
    expect(tallyResponses(form, responses)).toEqual({ o1: 2, o2: 0 });
  });
});

describe("workhubStore", () => {
  it("requestApproval prepends a pending request (wired in AppsPanel)", () => {
    const before = useWorkhubStore.getState().approvals.length;
    useWorkhubStore.getState().requestApproval("New budget");
    const list = useWorkhubStore.getState().approvals;
    expect(list.length).toBe(before + 1);
    expect(list[0]).toMatchObject({ title: "New budget", status: "pending" });
  });

  it("decideApproval sets status; claimShift assigns self; respondForm appends", () => {
    useWorkhubStore.getState().decideApproval("ap1", "approved");
    expect(useWorkhubStore.getState().approvals.find((a) => a.id === "ap1")!.status).toBe("approved");
    useWorkhubStore.getState().claimShift("sh4");
    const claimed = useWorkhubStore.getState().shifts.find((s) => s.id === "sh4")!;
    expect(claimed.userId).toBe("usr_1");
    expect(claimed.open).toBe(false);
    const before = useWorkhubStore.getState().responses.length;
    useWorkhubStore.getState().respondForm("fm_lunch", "o3");
    expect(useWorkhubStore.getState().responses.length).toBe(before + 1);
  });
});

describe("docs API contracts", () => {
  it("fetchDocs / fetchBoard resolve", async () => {
    const docs = await fetchDocs();
    expect(docs[0].title).toBeTruthy();
    const board = await fetchBoard();
    expect(board.columns.length).toBeGreaterThan(0);
  });
});

describe("Docs UI", () => {
  const wrap = (node: ReactNode) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{node}</MemoryRouter>
    </QueryClientProvider>
  );

  it("DocsPage renders the canvas doc title", () => {
    render(wrap(<DocsPage />));
    expect(screen.getAllByText(/Q3 Launch Plan/).length).toBeGreaterThan(0);
  });

  it("KanbanBoard renders a card + add-card input", () => {
    render(wrap(<KanbanBoard />));
    expect(screen.getByText("Pricing page")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("Add card").length).toBeGreaterThan(0);
  });

  it("AppsPanel renders Approvals / Shifts / Forms", () => {
    render(wrap(<AppsPanel />));
    expect(screen.getByText("Approvals")).toBeInTheDocument();
    expect(screen.getByText("Shifts")).toBeInTheDocument();
    expect(screen.getByText("Forms")).toBeInTheDocument();
  });
});

describe("Clips (Loom parity) — pure util", () => {
  it("removeFillerWords strips EN + TR fillers", () => {
    const en = removeFillerWords("Um, this is uh basically done.");
    expect(en).not.toMatch(/basically/i);
    expect(en).not.toMatch(/\buh\b/i);
    expect(en).toContain("this is");
    const tr = removeFillerWords("şey yani bu tamam");
    expect(tr).not.toMatch(/yani/);
    expect(tr).toContain("bu tamam");
  });

  it("autoSummary takes the first sentences", () => {
    const s = autoSummary("First sentence. Second sentence. Third sentence.");
    expect(s).toContain("First sentence");
    expect(s).toContain("Second sentence");
    expect(s).not.toContain("Third");
  });

  it("autoChapters time-stamps evenly", () => {
    const ch = autoChapters("A part. B part. C part.", 90);
    expect(ch.length).toBe(3);
    expect(ch[0].atSec).toBe(0);
    expect(ch[1].atSec).toBe(30);
  });

  it("extractTasks finds action sentences", () => {
    const tasks = extractTasks("We should ship it. Nice work everyone.");
    expect(tasks.length).toBe(1);
    expect(tasks[0]).toContain("ship");
  });

  it("AI workflows transform a clip", () => {
    const clip = CLIPS[0];
    expect(clipToDoc(clip).startsWith("# Feature walkthrough")).toBe(true);
    expect(clipToWorkItem(clip).body).toContain("- [ ]");
    expect(clipToMessage(clip)).toContain("Feature walkthrough");
  });

  it("isLinkExpired / reactionTotal / topClips", () => {
    expect(isLinkExpired({ ...CLIPS[0], linkExpiresAt: Date.now() - 1000 })).toBe(true);
    expect(isLinkExpired(CLIPS[1])).toBe(false);
    expect(reactionTotal(CLIPS[0])).toBe(11);
    expect(topClips(CLIPS, 1)[0].id).toBe("clip_demo");
  });
});

describe("Clips (Loom parity) — store & render", () => {
  it("generateAiClip fills summary, chapters and tasks", () => {
    useDocsStore.getState().generateAiClip("clip_retro");
    const c = useDocsStore.getState().clips.find((x) => x.id === "clip_retro")!;
    expect(c.summary).toBeTruthy();
    expect((c.chapters ?? []).length).toBeGreaterThan(0);
    expect((c.tasks ?? []).length).toBeGreaterThan(0);
  });

  it("privacy, reactions, archive, views, cta, expiry actions", () => {
    useDocsStore.getState().setClipPrivacy("clip_retro", "people");
    expect(useDocsStore.getState().clips.find((x) => x.id === "clip_retro")!.privacy).toBe("people");

    useDocsStore.getState().toggleClipReaction("clip_retro", "🔥");
    expect(useDocsStore.getState().clips.find((x) => x.id === "clip_retro")!.reactions!.some((r) => r.emoji === "🔥")).toBe(true);
    useDocsStore.getState().toggleClipReaction("clip_retro", "🔥");
    expect(useDocsStore.getState().clips.find((x) => x.id === "clip_retro")!.reactions!.some((r) => r.emoji === "🔥")).toBe(false);

    const arch = useDocsStore.getState().clips.find((x) => x.id === "clip_retro")!.archived ?? false;
    useDocsStore.getState().archiveClip("clip_retro");
    expect(useDocsStore.getState().clips.find((x) => x.id === "clip_retro")!.archived).toBe(!arch);

    const views = useDocsStore.getState().clips.find((x) => x.id === "clip_demo")!.views;
    useDocsStore.getState().viewClip("clip_demo");
    expect(useDocsStore.getState().clips.find((x) => x.id === "clip_demo")!.views).toBe(views + 1);

    const clicks = useDocsStore.getState().clips.find((x) => x.id === "clip_demo")!.ctaClicks ?? 0;
    useDocsStore.getState().clickCta("clip_demo");
    expect(useDocsStore.getState().clips.find((x) => x.id === "clip_demo")!.ctaClicks).toBe(clicks + 1);

    useDocsStore.getState().setClipExpiry("clip_retro", Date.now() - 1000);
    expect(isLinkExpired(useDocsStore.getState().clips.find((x) => x.id === "clip_retro")!)).toBe(true);
  });

  it("removeFiller marks the clip and createVariables sets copies", () => {
    useDocsStore.getState().removeFiller("clip_demo");
    expect(useDocsStore.getState().clips.find((x) => x.id === "clip_demo")!.fillerRemoved).toBe(true);
    useDocsStore.getState().createVariables("clip_demo", 25);
    expect(useDocsStore.getState().clips.find((x) => x.id === "clip_demo")!.variablesCopies).toBe(25);
  });

  it("ClipsList renders the clip surface", () => {
    render(<ClipsList />);
    expect(screen.getByText("Clips")).toBeInTheDocument();
    expect(screen.getAllByText(/Feature walkthrough/).length).toBeGreaterThan(0);
  });
});
