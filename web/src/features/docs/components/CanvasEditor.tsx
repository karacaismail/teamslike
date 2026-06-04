import * as React from "react";
import { useTranslation } from "react-i18next";
import { Plus, CheckSquare, Square } from "@/lib/icons";
import { useDocsStore } from "../docsStore";
import { useTenantStore } from "@/store/tenantStore";
import { docProgress } from "../docs";
import { Card } from "@/components/ui/primitives";
import type { BlockType } from "../types";

const TYPES: BlockType[] = ["text", "heading", "todo", "divider"];

export function CanvasEditor() {
  const { t } = useTranslation();
  const docs = useDocsStore((s) => s.docs);
  const activeDocId = useDocsStore((s) => s.activeDocId);
  const doc = docs.find((d) => d.id === activeDocId)!;
  const { toggleBlock, addBlock, editBlock, setActiveDoc } = useDocsStore.getState();
  const [content, setContent] = React.useState("");
  const [type, setType] = React.useState<BlockType>("text");

  // Docs are scoped to the active workspace (J5). The doc lookup above still
  // searches all docs (never crashes); the dropdown + this effect keep the
  // active doc within the current workspace.
  const workspaceId = useTenantStore((s) => s.workspaceId);
  const visibleDocs = docs.filter((d) => d.workspaceId == null || d.workspaceId === workspaceId);
  React.useEffect(() => {
    if (visibleDocs[0] && !visibleDocs.some((d) => d.id === activeDocId)) setActiveDoc(visibleDocs[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const prog = docProgress(doc.blocks);
  const add = () => {
    if (type !== "divider" && !content.trim()) return;
    addBlock(doc.id, type, content.trim());
    setContent("");
  };

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          value={doc.id}
          onChange={(e) => setActiveDoc(e.target.value)}
          aria-label={t("docs.selectDoc")}
          className="h-9 rounded-md border border-border bg-bg px-2 text-xl font-bold text-fg"
        >
          {visibleDocs.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
        </select>
        {prog.total > 0 ? (
          <span className="ml-auto inline-flex items-center gap-2 text-base text-muted">
            {t("docs.progress", { done: prog.done, total: prog.total })}
            <span className="h-2 w-24 overflow-hidden rounded-full bg-surface">
              <span className="block h-full bg-positive" style={{ width: `${prog.pct}%` }} aria-hidden />
            </span>
            {prog.pct}%
          </span>
        ) : null}
      </div>

      <div className="space-y-1.5">
        {doc.blocks.map((b) => {
          if (b.type === "heading")
            return (
              <input
                key={b.id}
                value={b.content}
                onChange={(e) => editBlock(doc.id, b.id, e.target.value)}
                aria-label={t("docs.editBlock")}
                className="w-full rounded-md bg-transparent px-1 text-lg font-semibold text-fg outline-none focus:bg-surface"
              />
            );
          if (b.type === "divider") return <hr key={b.id} className="border-border" />;
          if (b.type === "todo")
            return (
              <button
                key={b.id}
                onClick={() => toggleBlock(doc.id, b.id)}
                aria-pressed={b.checked}
                className="flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left text-base hover:bg-surface"
              >
                {b.checked ? <CheckSquare size={18} className="text-positive" aria-hidden /> : <Square size={18} className="text-muted" aria-hidden />}
                <span className={b.checked ? "text-muted line-through" : "text-fg"}>{b.content}</span>
              </button>
            );
          return (
            <input
              key={b.id}
              value={b.content}
              onChange={(e) => editBlock(doc.id, b.id, e.target.value)}
              aria-label={t("docs.editBlock")}
              className="w-full rounded-md bg-transparent px-1 text-base text-fg outline-none focus:bg-surface"
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
        <select value={type} onChange={(e) => setType(e.target.value as BlockType)} aria-label={t("docs.blockTypeLabel")} className="h-11 rounded-md border border-border bg-bg px-2 text-base text-fg">
          {TYPES.map((ty) => <option key={ty} value={ty}>{t(`docs.blockType.${ty}`)}</option>)}
        </select>
        {type !== "divider" ? (
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder={t("docs.blockPh")}
            aria-label={t("docs.blockPh")}
            className="h-11 flex-1 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none placeholder:text-muted"
          />
        ) : null}
        <button onClick={add} className="inline-flex h-11 items-center gap-1 rounded-md bg-accent px-3 text-base text-accent-fg">
          <Plus size={16} aria-hidden /> {t("docs.addBlock")}
        </button>
      </div>
    </Card>
  );
}
