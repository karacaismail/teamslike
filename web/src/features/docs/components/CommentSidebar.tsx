import * as React from "react";
import { useTranslation } from "react-i18next";
import { ChatText, Check, UsersThree, PaperPlaneRight } from "@/lib/icons";
import { useDocsStore } from "../docsStore";
import { commentsForDoc } from "../collab";
import { MEMBER_NAMES } from "../data";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { TEAM } from "@/data/team";
import { Avatar } from "@/components/ui/Avatar";
import { Button, Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

/**
 * Inline doc comments + presence + a simulated concurrent edit (Faz 9 collab).
 * The "simulate teammate edit" button stands in for a CRDT/OT peer: it applies
 * a remote edit that merges into the live doc, demonstrating co-editing.
 */
export function CommentSidebar() {
  const { t } = useTranslation();
  const docs = useDocsStore((s) => s.docs);
  const activeDocId = useDocsStore((s) => s.activeDocId);
  const comments = useDocsStore((s) => s.comments);
  const addComment = useDocsStore((s) => s.addComment);
  const resolveComment = useDocsStore((s) => s.resolveComment);
  const applyRemoteEdit = useDocsStore((s) => s.applyRemoteEdit);
  const me = useAuthStore((a) => a.principal?.id ?? "usr_1");
  const push = useToastStore((s) => s.push);

  const doc = docs.find((d) => d.id === activeDocId);
  const docComments = commentsForDoc(comments, activeDocId);
  const blocks = (doc?.blocks ?? []).filter((b) => b.type !== "divider");
  const snippet = (bid: string) => blocks.find((b) => b.id === bid)?.content?.slice(0, 40) || "—";

  const [blockId, setBlockId] = React.useState("");
  const [body, setBody] = React.useState("");

  const post = () => {
    const target = blockId || blocks[0]?.id;
    if (!target || !body.trim()) return;
    addComment(activeDocId, target, me, body.trim());
    setBody("");
  };

  return (
    <Card>
      <div className="mb-2 flex items-center gap-2">
        <h3 className="flex items-center gap-1 text-base font-semibold text-fg">
          <ChatText size={18} aria-hidden /> {t("docs.comments.title")}
        </h3>
        <div className="ml-auto flex -space-x-2" aria-label={t("docs.comments.viewing")}>
          {TEAM.slice(0, 3).map((m) => <Avatar key={m.id} name={m.name} size={24} />)}
        </div>
      </div>

      <Button
        variant="secondary"
        className="mb-3 w-full"
        onClick={() => {
          applyRemoteEdit(activeDocId);
          push({ title: t("docs.comments.remoteEdit"), tone: "neutral" });
        }}
      >
        <UsersThree size={16} aria-hidden /> {t("docs.comments.simulate")}
      </Button>

      <ul className="space-y-2">
        {docComments.length === 0 ? <li className="text-base text-muted">{t("docs.comments.empty")}</li> : null}
        {docComments.map((c) => (
          <li key={c.id} className={cn("rounded-md border border-border p-2", c.resolved ? "opacity-60" : "")}>
            <div className="flex items-center gap-2">
              <Avatar name={MEMBER_NAMES[c.authorId] ?? c.authorId} size={22} />
              <span className="text-base font-medium text-fg">{MEMBER_NAMES[c.authorId] ?? c.authorId}</span>
              {c.resolved ? (
                <span className="ml-auto text-base text-positive">{t("docs.comments.resolved")}</span>
              ) : (
                <button onClick={() => resolveComment(c.id)} className="ml-auto inline-flex items-center gap-1 text-base text-accent hover:underline">
                  <Check size={14} aria-hidden /> {t("docs.comments.resolve")}
                </button>
              )}
            </div>
            <p className={cn("mt-1 text-base", c.resolved ? "text-muted line-through" : "text-fg")}>{c.body}</p>
            <p className="text-base text-muted">↳ {snippet(c.blockId)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-3 border-t border-border pt-2">
        <select
          value={blockId}
          onChange={(e) => setBlockId(e.target.value)}
          aria-label={t("docs.comments.anchor")}
          className="mb-1 h-9 w-full rounded-md border border-border bg-bg px-2 text-base text-fg"
        >
          <option value="">{t("docs.comments.anchor")}…</option>
          {blocks.map((b) => <option key={b.id} value={b.id}>{b.content.slice(0, 30) || b.type}</option>)}
        </select>
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("docs.comments.placeholder")}
            aria-label={t("docs.comments.placeholder")}
            className="min-h-[2.5rem] flex-1 resize-none rounded-md border border-border bg-bg p-2 text-base text-fg outline-none placeholder:text-muted"
          />
          <Button variant="primary" disabled={!body.trim()} onClick={post} aria-label={t("docs.comments.post")}>
            <PaperPlaneRight size={16} aria-hidden />
          </Button>
        </div>
      </div>
    </Card>
  );
}
