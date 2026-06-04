import * as React from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "@/lib/icons";
import { useStoriesStore } from "../storiesStore";
import { useAuthStore } from "@/store/authStore";
import { memberName } from "../members";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

/** WhatsApp Status / Telegram Stories — ephemeral status ring strip. */
export function StoriesBar() {
  const { t } = useTranslation();
  const stories = useStoriesStore((s) => s.stories);
  const { addStory, markSeen } = useStoriesStore.getState();
  const me = useAuthStore((a) => a.principal?.id ?? "usr_1");
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [viewing, setViewing] = React.useState<string | null>(null);
  const current = stories.find((s) => s.id === viewing) ?? null;

  const submit = () => {
    if (!draft.trim()) return;
    addStory(me, draft.trim());
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="border-b border-border bg-raised px-3 py-2">
      <div className="flex items-center gap-3 overflow-x-auto">
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex shrink-0 flex-col items-center gap-1"
          aria-expanded={adding}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-border text-muted">
            <Plus size={20} aria-hidden />
          </span>
          <span className="text-base text-muted">{t("messaging.stories.add")}</span>
        </button>

        {stories.map((st) => {
          const seen = st.seenBy.includes(me);
          return (
            <button
              key={st.id}
              onClick={() => {
                markSeen(st.id, me);
                setViewing(st.id);
              }}
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <span className={cn("rounded-full p-0.5 ring-2", seen ? "ring-border" : "ring-accent")}>
                <Avatar name={memberName(st.authorId)} size={44} />
              </span>
              <span className="max-w-[4rem] truncate text-base text-fg">{memberName(st.authorId)}</span>
            </button>
          );
        })}
      </div>

      {adding ? (
        <div className="mt-2 flex items-end gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={t("messaging.stories.placeholder")}
            aria-label={t("messaging.stories.placeholder")}
            className="h-10 flex-1 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none placeholder:text-muted"
          />
          <Button onClick={submit} disabled={!draft.trim()}>
            {t("messaging.stories.post")}
          </Button>
        </div>
      ) : null}

      {current ? (
        <div className="mt-2 rounded-md border border-accent bg-surface p-3" aria-live="polite">
          <div className="text-base font-medium text-fg">{memberName(current.authorId)}</div>
          <div className="text-base text-fg">{current.text}</div>
          <button onClick={() => setViewing(null)} className="mt-1 text-base text-muted hover:text-fg">
            {t("messaging.stories.close")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
