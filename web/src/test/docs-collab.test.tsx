import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@/i18n";
import i18n from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { useDocsStore } from "@/features/docs/docsStore";
import { CommentSidebar } from "@/features/docs/components/CommentSidebar";

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});
beforeEach(() => useDocsStore.getState().reset());

describe("docs collaboration store (Faz 9)", () => {
  it("addComment appends and resolveComment marks resolved", () => {
    const before = useDocsStore.getState().comments.length;
    useDocsStore.getState().addComment("doc_launch", "b2", "usr_1", "Looks good");
    const list = useDocsStore.getState().comments;
    expect(list.length).toBe(before + 1);
    const id = list[0].id;
    useDocsStore.getState().resolveComment(id);
    expect(useDocsStore.getState().comments.find((c) => c.id === id)!.resolved).toBe(true);
  });

  it("applyRemoteEdit merges a simulated teammate edit into a block (CRDT stand-in)", () => {
    const doc = () => useDocsStore.getState().docs.find((d) => d.id === "doc_launch")!;
    const target = doc().blocks.find((b) => b.type === "text" || b.type === "heading")!;
    const before = target.content;
    useDocsStore.getState().applyRemoteEdit("doc_launch");
    const after = doc().blocks.find((b) => b.id === target.id)!.content;
    expect(after).not.toBe(before);
    expect(after).toContain("Defne");
  });
});

describe("CommentSidebar render", () => {
  it("shows the seeded comment, presence and the simulate button", () => {
    render(<CommentSidebar />);
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText(/Simulate teammate edit/)).toBeInTheDocument();
    expect(screen.getByText(/confirm the 14:00 cutoff/)).toBeInTheDocument();
  });
});
