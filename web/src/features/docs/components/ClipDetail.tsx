import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  VideoCamera,
  Sparkle,
  Scissors,
  WaveSawtooth,
  ChatText,
  LinkSimple,
  LockKey,
  Clock,
  CursorClick,
  FileText,
  Kanban,
  PaperPlaneRight,
  UsersThree,
  Eye,
} from "@/lib/icons";
import { useDocsStore } from "../docsStore";
import { useAuthStore } from "@/store/authStore";
import { MEMBER_NAMES } from "../data";
import { clipToDoc, clipToWorkItem, clipToMessage, completionRate, isLinkExpired } from "../clips";
import { Badge, Button, Card, IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { Clip, ClipPrivacy } from "../types";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const PRIVACIES: ClipPrivacy[] = ["link", "workspace", "people"];
const EMOJIS = ["👍", "🔥", "🎉", "👏"];

export function ClipDetail({ clip }: { clip: Clip }) {
  const { t } = useTranslation();
  const me = useAuthStore((a) => a.principal?.id ?? "usr_1");
  const generateAi = useDocsStore((s) => s.generateAiClip);
  const setPrivacy = useDocsStore((s) => s.setClipPrivacy);
  const setPassword = useDocsStore((s) => s.setClipPassword);
  const setExpiry = useDocsStore((s) => s.setClipExpiry);
  const addComment = useDocsStore((s) => s.addClipComment);
  const toggleReaction = useDocsStore((s) => s.toggleClipReaction);
  const setCta = useDocsStore((s) => s.setClipCta);
  const removeFiller = useDocsStore((s) => s.removeFiller);
  const removeSilence = useDocsStore((s) => s.removeSilence);
  const archiveClip = useDocsStore((s) => s.archiveClip);
  const createVariables = useDocsStore((s) => s.createVariables);
  const clickCta = useDocsStore((s) => s.clickCta);

  const [comment, setComment] = React.useState("");
  const [pwd, setPwd] = React.useState(clip.password ?? "");
  const [ctaLabel, setCtaLabel] = React.useState(clip.ctaLabel ?? "");
  const [ctaUrl, setCtaUrl] = React.useState(clip.ctaUrl ?? "");
  const [output, setOutput] = React.useState("");
  const [copies, setCopies] = React.useState(10);

  const pct = Math.round(completionRate(clip) * 100);
  const expired = isLinkExpired(clip);

  return (
    <Card as="article" className="space-y-4">
      {/* Header + player placeholder */}
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-fg">{clip.title}</h3>
          <Badge tone="accent">{t(`docs.clip.recordMode.${clip.recordMode ?? "screen_cam"}`)}</Badge>
          <Badge tone={clip.privacy === "link" ? "warning" : "neutral"}>{t(`docs.clip.privacy.${clip.privacy ?? "workspace"}`)}</Badge>
          {clip.archived ? <Badge tone="neutral">{t("docs.clip.archived")}</Badge> : null}
          <span className="ml-auto inline-flex items-center gap-1 text-base text-muted">
            <Eye size={16} aria-hidden /> {t("docs.views", { n: clip.views })}
          </span>
        </div>
        <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-surface text-muted">
          <VideoCamera size={48} aria-hidden />
        </div>
        {/* Engagement */}
        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between text-base">
            <span className="text-muted">{t("docs.clip.completion")}</span>
            <span className="font-medium text-fg">{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Editing */}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => removeFiller(clip.id)} disabled={clip.fillerRemoved}>
          <Scissors size={18} aria-hidden /> {clip.fillerRemoved ? t("docs.clip.fillerDone") : t("docs.clip.removeFiller")}
        </Button>
        <Button variant="secondary" onClick={() => removeSilence(clip.id)} disabled={clip.silenceRemoved}>
          <WaveSawtooth size={18} aria-hidden /> {clip.silenceRemoved ? t("docs.clip.silenceDone") : t("docs.clip.removeSilence")}
        </Button>
        <Button variant="secondary" onClick={() => archiveClip(clip.id)}>
          {clip.archived ? t("docs.clip.unarchive") : t("docs.clip.archive")}
        </Button>
      </div>

      {/* AI */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <Sparkle size={18} className="text-accent" aria-hidden />
          <h4 className="text-base font-semibold text-fg">{t("docs.clip.ai")}</h4>
          <Button className="ml-auto" onClick={() => generateAi(clip.id)}>
            {t("docs.clip.generateAi")}
          </Button>
        </div>
        {clip.summary ? <p className="mb-2 text-base text-fg">{clip.summary}</p> : null}
        {clip.chapters && clip.chapters.length > 0 ? (
          <ul className="mb-2 space-y-1">
            {clip.chapters.map((ch, i) => (
              <li key={i} className="flex items-center gap-2 text-base text-fg">
                <span className="tabular-nums text-muted">{fmt(ch.atSec)}</span> {ch.title}
              </li>
            ))}
          </ul>
        ) : null}
        {clip.tasks && clip.tasks.length > 0 ? (
          <ul className="mb-2 list-disc space-y-0.5 pl-5">
            {clip.tasks.map((task, i) => (
              <li key={i} className="text-base text-fg">{task}</li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setOutput(clipToDoc(clip))}>
            <FileText size={18} aria-hidden /> {t("docs.clip.toDoc")}
          </Button>
          <Button variant="secondary" onClick={() => { const w = clipToWorkItem(clip); setOutput(`${w.title}\n\n${w.body}`); }}>
            <Kanban size={18} aria-hidden /> {t("docs.clip.toTicket")}
          </Button>
          <Button variant="secondary" onClick={() => setOutput(clipToMessage(clip))}>
            <PaperPlaneRight size={18} aria-hidden /> {t("docs.clip.toMessage")}
          </Button>
        </div>
        {output ? (
          <label className="mt-2 block">
            <span className="sr-only">{t("docs.clip.output")}</span>
            <textarea readOnly value={output} rows={5} className="w-full rounded-md border border-border bg-surface p-2 text-base text-fg" />
          </label>
        ) : null}
      </section>

      {/* Transcript */}
      <section>
        <h4 className="mb-1 text-base font-semibold text-fg">{t("docs.transcript")}</h4>
        <p className="text-base text-muted">{clip.transcript || "—"}</p>
      </section>

      {/* Comments + reactions */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <ChatText size={18} className="text-accent" aria-hidden />
          <h4 className="text-base font-semibold text-fg">{t("docs.clip.comments")}</h4>
          <div className="ml-auto flex gap-1">
            {EMOJIS.map((e) => {
              const hit = clip.reactions?.find((r) => r.emoji === e);
              return (
                <button
                  key={e}
                  onClick={() => toggleReaction(clip.id, e)}
                  aria-pressed={!!hit}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    hit ? "border-accent bg-surface text-fg" : "border-border text-muted hover:bg-surface",
                  )}
                >
                  {e} {hit ? hit.count : ""}
                </button>
              );
            })}
          </div>
        </div>
        <ul className="mb-2 space-y-1">
          {(clip.comments ?? []).map((c) => (
            <li key={c.id} className="rounded-md border border-border px-3 py-1.5 text-base">
              <span className="font-medium text-fg">{MEMBER_NAMES[c.authorId] ?? c.authorId}</span>
              <span className="text-muted"> · {fmt(c.atSec)}</span>
              <div className="text-fg">{c.body}</div>
            </li>
          ))}
        </ul>
        <div className="flex items-end gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("docs.clip.commentPh")}
            aria-label={t("docs.clip.commentPh")}
            className="h-11 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <Button
            onClick={() => {
              if (!comment.trim()) return;
              addComment(clip.id, me, 0, comment.trim());
              setComment("");
            }}
          >
            {t("docs.clip.addComment")}
          </Button>
        </div>
      </section>

      {/* Sharing & privacy */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <LinkSimple size={18} className="text-accent" aria-hidden />
          <h4 className="text-base font-semibold text-fg">{t("docs.clip.sharing")}</h4>
          {expired ? <Badge tone="danger" className="ml-auto">{t("docs.clip.expired")}</Badge> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-base text-muted"><UsersThree size={16} aria-hidden /> {t("docs.clip.privacyLabel")}</span>
          <select
            value={clip.privacy ?? "workspace"}
            onChange={(e) => setPrivacy(clip.id, e.target.value as ClipPrivacy)}
            aria-label={t("docs.clip.privacyLabel")}
            className="h-11 rounded-md border border-border bg-surface px-2 text-base text-fg"
          >
            {PRIVACIES.map((p) => (
              <option key={p} value={p}>{t(`docs.clip.privacy.${p}`)}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1">
            <span className="mb-1 flex items-center gap-1 text-base text-muted"><LockKey size={16} aria-hidden /> {t("docs.clip.password")}</span>
            <input
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder={t("docs.clip.passwordPh")}
              aria-label={t("docs.clip.password")}
              className="h-11 w-full rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </label>
          <Button variant="secondary" onClick={() => setPassword(clip.id, pwd)}>{t("docs.clip.setPassword")}</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-base text-muted"><Clock size={16} aria-hidden /> {t("docs.clip.expiry")}</span>
          <Button variant="secondary" onClick={() => setExpiry(clip.id, Date.now() + 7 * 86_400_000)}>{t("docs.clip.expire7d")}</Button>
          <Button variant="ghost" onClick={() => setExpiry(clip.id, null)}>{t("docs.clip.noExpiry")}</Button>
        </div>
      </section>

      {/* CTA */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <CursorClick size={18} className="text-accent" aria-hidden />
          <h4 className="text-base font-semibold text-fg">{t("docs.clip.cta")}</h4>
          <Badge tone="neutral" className="ml-auto">{t("docs.clip.ctaClicks", { n: clip.ctaClicks ?? 0 })}</Badge>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder={t("docs.clip.ctaLabelPh")} aria-label={t("docs.clip.ctaLabelPh")} className="h-11 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent" />
          <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder={t("docs.clip.ctaUrlPh")} aria-label={t("docs.clip.ctaUrlPh")} className="h-11 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent" />
          <Button variant="secondary" onClick={() => setCta(clip.id, ctaLabel, ctaUrl)}>{t("docs.clip.setCta")}</Button>
        </div>
        {clip.ctaLabel ? (
          <Button onClick={() => clickCta(clip.id)}>{clip.ctaLabel}</Button>
        ) : null}
      </section>

      {/* Variables */}
      <section className="flex flex-wrap items-end gap-2">
        <label>
          <span className="mb-1 block text-base font-medium text-fg">{t("docs.clip.variables")}</span>
          <input type="number" min={1} max={100} value={copies} onChange={(e) => setCopies(Number(e.target.value))} aria-label={t("docs.clip.variables")} className="h-11 w-24 rounded-md border border-border bg-surface px-2 text-base text-fg" />
        </label>
        <Button variant="secondary" onClick={() => createVariables(clip.id, copies)}>{t("docs.clip.createVariables")}</Button>
        {clip.variablesCopies ? <Badge tone="positive">{t("docs.clip.copies", { n: clip.variablesCopies })}</Badge> : null}
      </section>
    </Card>
  );
}
