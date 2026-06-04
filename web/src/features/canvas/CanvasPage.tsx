import * as React from "react";
import { Forbidden } from "@/components/ui/Forbidden";
import { useTranslation } from "react-i18next";
import { Prohibit, Sparkle, PaperPlaneRight, Trash } from "@/lib/icons";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, Button, Card, EmptyState, IconButton } from "@/components/ui/primitives";
import { useCanvasStore } from "./store";
import { docCounts } from "./canvas";
import { CanvasBlockCard } from "./components/CanvasBlockCard";

export function AiCanvasPage() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.can);
  const doc = useCanvasStore((s) => s.doc);
  const prompts = useCanvasStore((s) => s.prompts);
  const runPrompt = useCanvasStore((s) => s.runPrompt);
  const runPromptId = useCanvasStore((s) => s.runPromptId);
  const clear = useCanvasStore((s) => s.clear);
  const [text, setText] = React.useState("");

  if (!can("canvas.view")) {
    return <Forbidden />;
  }

  const counts = docCounts(doc);
  const total = doc.blocks.length;
  const ordered = [...doc.blocks].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));

  const submit = () => {
    if (!text.trim()) return;
    runPrompt(text.trim());
    setText("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Sparkle size={28} className="text-accent" aria-hidden />
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-fg">{doc.title}</h1>
          <p className="mt-1 text-base text-muted">{t("canvas.subtitle")}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center -space-x-2" aria-label={t("canvas.collaborators")}>
            {doc.collaborators.map((name) => (
              <span key={name} className="rounded-full ring-2 ring-bg" title={name}>
                <Avatar name={name} size={28} />
              </span>
            ))}
          </div>
          <Badge tone="neutral">{t("canvas.blocks", { n: total })}</Badge>
        </div>
      </div>

      {/* Prompt bar */}
      <Card>
        <div className="flex items-end gap-2">
          <label htmlFor="canvas-prompt" className="sr-only">
            {t("canvas.promptPh")}
          </label>
          <input
            id="canvas-prompt"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={t("canvas.promptPh")}
            className="h-11 flex-1 rounded-md border border-border bg-surface px-3 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <Button onClick={submit} disabled={!text.trim()}>
            <PaperPlaneRight size={18} aria-hidden /> {t("canvas.run")}
          </Button>
          {total > 0 ? (
            <IconButton label={t("canvas.clear")} variant="ghost" onClick={clear}>
              <Trash size={18} aria-hidden />
            </IconButton>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-base text-muted">{t("canvas.suggestions")}:</span>
          {prompts.map((p) => (
            <button
              key={p.id}
              onClick={() => runPromptId(p.id)}
              className="rounded-full border border-border bg-surface px-3 py-1 text-base text-fg hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {p.label}
            </button>
          ))}
        </div>
      </Card>

      {total === 0 ? (
        <EmptyState
          icon={<Sparkle size={28} aria-hidden />}
          title={t("canvas.empty")}
          hint={t("canvas.emptyHint")}
        />
      ) : (
        <div className="space-y-3">
          {ordered.map((block) => (
            <CanvasBlockCard key={block.id} block={block} />
          ))}
        </div>
      )}
    </div>
  );
}
