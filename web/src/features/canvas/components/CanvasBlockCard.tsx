import { useTranslation } from "react-i18next";
import { PushPin, Trash, ArrowUp, ArrowDown } from "@/lib/icons";
import { useCanvasStore } from "../store";
import { blockProgress } from "../canvas";
import { Badge, Card, IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { CanvasBlock } from "../types";

export function CanvasBlockCard({ block }: { block: CanvasBlock }) {
  const { t } = useTranslation();
  const togglePin = useCanvasStore((s) => s.togglePin);
  const removeBlock = useCanvasStore((s) => s.removeBlock);
  const toggleItem = useCanvasStore((s) => s.toggleItem);
  const moveBlock = useCanvasStore((s) => s.moveBlock);

  const progress = blockProgress(block);

  return (
    <Card as="article" className={cn(block.pinned && "ring-1 ring-accent")}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge tone="accent">{t(`canvas.kind.${block.kind}`)}</Badge>
        <h3 className="text-lg font-semibold text-fg">{block.title}</h3>
        <div className="ml-auto flex items-center gap-1">
          <IconButton
            label={block.pinned ? t("canvas.unpin") : t("canvas.pin")}
            variant={block.pinned ? "primary" : "ghost"}
            onClick={() => togglePin(block.id)}
          >
            <PushPin size={18} aria-hidden weight={block.pinned ? "fill" : "regular"} />
          </IconButton>
          <IconButton label={t("canvas.moveUp")} variant="ghost" onClick={() => moveBlock(block.id, "up")}>
            <ArrowUp size={18} aria-hidden />
          </IconButton>
          <IconButton label={t("canvas.moveDown")} variant="ghost" onClick={() => moveBlock(block.id, "down")}>
            <ArrowDown size={18} aria-hidden />
          </IconButton>
          <IconButton label={t("canvas.remove")} variant="ghost" onClick={() => removeBlock(block.id)}>
            <Trash size={18} aria-hidden />
          </IconButton>
        </div>
      </div>

      {block.sources.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1">
          {block.sources.map((src) => (
            <span key={src} className="rounded-sm border border-border bg-surface px-1.5 py-0.5 text-base text-muted">
              {t(`canvas.source.${src}`)}
            </span>
          ))}
        </div>
      ) : null}

      {(block.kind === "summary" || block.kind === "text") && block.body ? (
        <p className="text-base text-fg">{block.body}</p>
      ) : null}

      {(block.kind === "actions" || block.kind === "checklist") && block.items ? (
        <>
          {block.kind === "checklist" ? (
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
              <div className="h-full bg-accent transition-all motion-reduce:transition-none" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          ) : null}
          <ul className="space-y-1">
            {block.items.map((it) => (
              <li key={it.id}>
                <label className="flex items-center gap-2 text-base text-fg">
                  <input
                    type="checkbox"
                    checked={it.done}
                    onChange={() => toggleItem(block.id, it.id)}
                    className="h-4 w-4 accent-accent"
                  />
                  <span className={cn(it.done && "text-muted line-through")}>{it.text}</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {block.kind === "table" && block.table ? (
        <table className="w-full border-collapse text-base">
          <thead>
            <tr>
              {block.table.columns.map((c) => (
                <th key={c} className="border-b border-border px-2 py-1 text-left font-semibold text-fg">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border-b border-border px-2 py-1 text-fg">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {block.kind === "metrics" && block.metrics ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {block.metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-border p-3">
              <div className="text-base text-muted">{m.label}</div>
              <div className="mt-1 text-2xl font-semibold text-fg">{m.value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
