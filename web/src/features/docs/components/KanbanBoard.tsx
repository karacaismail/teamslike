import * as React from "react";
import { useTranslation } from "react-i18next";
import { CaretLeft, CaretRight, User, Plus } from "@/lib/icons";
import { useDocsStore } from "../docsStore";
import { MEMBER_NAMES } from "../data";
import { Card, IconButton } from "@/components/ui/primitives";

export function KanbanBoard() {
  const { t } = useTranslation();
  const board = useDocsStore((s) => s.board);
  const moveCard = useDocsStore((s) => s.moveCard);
  const addCard = useDocsStore((s) => s.addCard);
  const [draft, setDraft] = React.useState<Record<string, string>>({});

  const colIndex = (id: string) => board.columns.findIndex((c) => c.id === id);
  const submitCard = (columnId: string) => {
    const title = (draft[columnId] ?? "").trim();
    if (!title) return;
    addCard(title, columnId);
    setDraft((d) => ({ ...d, [columnId]: "" }));
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {board.columns.map((col) => {
        const cards = board.cards.filter((c) => c.columnId === col.id);
        const idx = colIndex(col.id);
        return (
          <Card key={col.id} className="p-3">
            <h3 className="mb-2 flex items-center justify-between text-base font-semibold text-fg">
              {col.title}
              <span className="text-base text-muted">{cards.length}</span>
            </h3>
            <ul className="space-y-2">
              {cards.map((cd) => (
                <li key={cd.id} className="rounded-md border border-border bg-surface p-2">
                  <div className="text-base text-fg">{cd.title}</div>
                  <div className="mt-1 flex items-center gap-2">
                    {cd.assigneeId ? (
                      <span className="inline-flex items-center gap-1 text-base text-muted">
                        <User size={14} aria-hidden /> {MEMBER_NAMES[cd.assigneeId] ?? cd.assigneeId}
                      </span>
                    ) : null}
                    {/* Keyboard-accessible move (drag-drop alternative). */}
                    <span className="ml-auto flex items-center gap-1">
                      <IconButton
                        label={t("docs.moveLeft")}
                        disabled={idx === 0}
                        onClick={() => moveCard(cd.id, board.columns[idx - 1].id)}
                      >
                        <CaretLeft size={16} aria-hidden />
                      </IconButton>
                      <IconButton
                        label={t("docs.moveRight")}
                        disabled={idx === board.columns.length - 1}
                        onClick={() => moveCard(cd.id, board.columns[idx + 1].id)}
                      >
                        <CaretRight size={16} aria-hidden />
                      </IconButton>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center gap-1">
              <input
                value={draft[col.id] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [col.id]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") submitCard(col.id); }}
                placeholder={t("docs.addCard")}
                aria-label={t("docs.addCard")}
                className="h-9 flex-1 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none placeholder:text-muted"
              />
              <IconButton label={t("docs.addCard")} onClick={() => submitCard(col.id)}>
                <Plus size={16} aria-hidden />
              </IconButton>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
