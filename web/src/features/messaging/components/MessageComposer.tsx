import * as React from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import { useUnsavedGuard } from "@/lib/useUnsavedGuard";
import {
  PaperPlaneRight,
  Sparkle,
  Paperclip,
  Microphone,
  Clock,
  Lightning,
  X,
  TextB,
  TextItalic,
  Code,
  Quotes,
  ListBullets,
  BellSlash,
  ChartBar,
  ImageSquare,
  FileText,
  MagicWand,
} from "@/lib/icons";
import { useMessagingStore } from "../store";
import { rewriteMessage, type RewriteTone } from "../chat";
import { TOPICS, CANNED } from "../data";
import { TEAM } from "@/data/team";
import { memberName } from "../members";
import { useAuthStore } from "@/store/authStore";
import { useAskCopilot } from "@/lib/useCopilot";
import { useToastStore } from "@/store/toastStore";
import { IconButton } from "@/components/ui/primitives";
import { EmojiPicker } from "./EmojiPicker";
import { GifStickerPicker } from "./GifStickerPicker";
import { ScheduledTray } from "./ScheduledTray";
import { CreatePollDialog } from "./CreatePollDialog";
import { cn } from "@/lib/cn";

const SLASH = [
  { key: "summarize", promptKey: "messaging.ai.summarize" },
  { key: "draft", promptKey: "messaging.ai.draft" },
  { key: "translate", promptKey: "messaging.ai.translate" },
];

export function MessageComposer() {
  const { t } = useTranslation();
  const store = useMessagingStore();
  const { activeChannelId, activeTopicId, messages, channels, replyTargetId, setReplyTarget, setDraft, send, sendNote, sendVoice, scheduleMessage, sendFile, sendSticker } = store;
  const me = useAuthStore((s) => s.principal?.id ?? "usr_1");
  const ask = useAskCopilot();
  const push = useToastStore((s) => s.push);

  const [text, setText] = React.useState(store.draftsByTopic[activeTopicId] ?? "");
  const [mode, setMode] = React.useState<"reply" | "note">("reply");
  const [silent, setSilent] = React.useState(false);
  const [trayOpen, setTrayOpen] = React.useState(false);
  const [pollOpen, setPollOpen] = React.useState(false);
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  // Guard an unsent draft against accidental reload / tab-close (J6).
  useUnsavedGuard("messaging-composer", text.trim().length > 0);

  // Load per-topic draft on topic switch.
  React.useEffect(() => {
    setText(store.draftsByTopic[activeTopicId] ?? "");
    setMode("reply");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopicId]);

  const update = (v: string) => {
    setText(v);
    setDraft(activeTopicId, v);
  };

  const channel = channels.find((c) => c.id === activeChannelId);
  const topic = TOPICS.find((tp) => tp.id === activeTopicId);
  const ctxName =
    channel?.kind === "channel" || channel?.kind === "private"
      ? `#${channel?.name} / ${topic?.title ?? ""}`
      : (channel?.name ?? "");
  const placeholder =
    mode === "note"
      ? t("messaging.notePlaceholder")
      : channel && (channel.kind === "channel" || channel.kind === "private")
        ? t("messaging.composerChannel", { name: channel.name })
        : t("messaging.composerDm", { name: channel?.name });

  const replyTarget = replyTargetId ? messages.find((m) => m.id === replyTargetId) : undefined;
  const scheduledCount = messages.filter((m) => m.topicId === activeTopicId && m.scheduled).length;
  const broadcastReadonly = channel?.kind === "broadcast";

  const isSlash = text.startsWith("/");
  const slashMatches = isSlash
    ? SLASH.filter((s) => s.key.includes(text.slice(1).toLowerCase()) || t(`messaging.slash.${s.key}`).toLowerCase().includes(text.slice(1).toLowerCase()))
    : [];

  // @mention autocomplete
  const mentionMatch = text.match(/(?:^|\s)@(\w*)$/);
  const mentionQuery = mentionMatch ? mentionMatch[1].toLowerCase() : null;
  const mentionCandidates =
    mentionQuery !== null
      ? [
          { id: "here", label: "here" },
          { id: "channel", label: "channel" },
          ...TEAM.map((m) => ({ id: m.id, label: m.name.split(" ")[0] })),
        ].filter((c) => c.label.toLowerCase().startsWith(mentionQuery))
      : [];

  const pickMention = (label: string) => {
    update(text.replace(/@(\w*)$/, `@${label} `));
    taRef.current?.focus();
  };

  const wrap = (pre: string, suf = pre) => {
    const ta = taRef.current;
    const start = ta?.selectionStart ?? text.length;
    const end = ta?.selectionEnd ?? text.length;
    const sel = text.slice(start, end) || t("messaging.text");
    update(text.slice(0, start) + pre + sel + suf + text.slice(end));
  };
  const linePrefix = (pre: string) => update((text ? text + "\n" : "") + pre);

  const insertEmoji = (e: string) => update(text + e);

  const runSlash = (promptKey: string) => {
    ask(t(promptKey), ctxName);
    update("");
  };

  const submit = () => {
    if (!text.trim()) return;
    if (isSlash) {
      if (slashMatches[0]) runSlash(slashMatches[0].promptKey);
      return;
    }
    if (mode === "note") sendNote(text, me);
    else send(text, me, replyTargetId ?? undefined, silent);
    setText("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && mentionCandidates.length === 0) {
      e.preventDefault();
      submit();
    }
  };

  if (broadcastReadonly) {
    return (
      <div className="border-t border-border bg-raised p-4 text-center text-base text-muted">
        {t("messaging.broadcastReadonly")}
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-raised p-3">
      {scheduledCount > 0 ? (
        <button
          onClick={() => setTrayOpen(true)}
          className="mb-2 inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-base text-muted hover:bg-raised"
        >
          <Clock size={14} aria-hidden />
          {t("messaging.scheduled", { n: scheduledCount })}
        </button>
      ) : null}

      {mode === "reply" && !replyTarget ? <SmartRepliesInline onPick={(s) => update(s)} /> : null}

      {replyTarget ? (
        <div className="mb-2 flex items-center gap-2 rounded-md border-l-2 border-accent bg-surface px-2 py-1 text-base">
          <span className="flex-1 truncate">
            <span className="font-medium text-accent">
              {t("messaging.replyingTo", { name: replyTarget.authorName ?? memberName(replyTarget.authorId) })}
            </span>
            <span className="ml-2 text-muted">{replyTarget.body.slice(0, 70)}</span>
          </span>
          <button onClick={() => setReplyTarget(null)} aria-label={t("messaging.cancel")} className="rounded-md p-1 text-muted hover:bg-raised">
            <X size={16} aria-hidden />
          </button>
        </div>
      ) : null}

      <div className="mb-2 inline-flex overflow-hidden rounded-md border border-border" role="tablist" aria-label={t("messaging.mode")}>
        {(["reply", "note"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn("h-9 px-3 text-base", mode === m ? (m === "note" ? "bg-warning text-bg" : "bg-accent text-accent-fg") : "bg-raised text-muted hover:bg-surface")}
          >
            {m === "reply" ? t("messaging.replyMode") : t("messaging.noteMode")}
          </button>
        ))}
      </div>

      <div className={cn("relative rounded-lg border p-2 focus-within:border-accent", mode === "note" ? "border-warning bg-surface" : "border-border bg-bg")}>
        {/* Formatting toolbar — desktop only; markdown typing still works on
            mobile, so this row is hidden there to keep the composer compact. */}
        <div className="mb-1 hidden items-center gap-0.5 border-b border-border pb-1 sm:flex">
          <FmtBtn label={t("messaging.bold")} onClick={() => wrap("**")}><TextB size={16} aria-hidden /></FmtBtn>
          <FmtBtn label={t("messaging.italic")} onClick={() => wrap("_")}><TextItalic size={16} aria-hidden /></FmtBtn>
          <FmtBtn label={t("messaging.code")} onClick={() => wrap("`")}><Code size={16} aria-hidden /></FmtBtn>
          <FmtBtn label={t("messaging.quote")} onClick={() => linePrefix("> ")}><Quotes size={16} aria-hidden /></FmtBtn>
          <FmtBtn label={t("messaging.list")} onClick={() => linePrefix("- ")}><ListBullets size={16} aria-hidden /></FmtBtn>
          <EmojiPicker onPick={insertEmoji} />
        </div>

        {isSlash && slashMatches.length > 0 ? (
          <ul className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-md border border-border bg-raised shadow-xl">
            <li className="px-3 py-1 text-base text-muted">{t("messaging.slashTitle")}</li>
            {slashMatches.map((s) => (
              <li key={s.key}>
                <button onClick={() => runSlash(s.promptKey)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-base text-fg hover:bg-surface">
                  <Sparkle size={16} className="text-accent" aria-hidden />
                  <span className="font-medium">/{s.key}</span>
                  <span className="text-muted">{t(`messaging.slash.${s.key}`)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {mentionCandidates.length > 0 ? (
          <ul className="absolute bottom-full left-0 mb-2 max-h-48 w-64 overflow-y-auto rounded-md border border-border bg-raised shadow-xl">
            {mentionCandidates.map((c) => (
              <li key={c.id}>
                <button onClick={() => pickMention(c.label)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-base text-fg hover:bg-surface">
                  <span className="font-medium text-accent">@{c.label}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <label htmlFor="composer" className="sr-only">{placeholder}</label>
        <textarea
          id="composer"
          ref={taRef}
          rows={2}
          value={text}
          onChange={(e) => update(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent text-base text-fg outline-none placeholder:text-muted focus-visible:shadow-none"
        />

        <div className="mt-1 flex items-center gap-1">
          {/* Actions scroll horizontally on narrow screens so the composer
              stays one short row; Send stays pinned on the right. */}
          <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          <Menu.Root>
            <Menu.Trigger
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-fg hover:bg-surface"
              aria-label={t("messaging.attach")}
            >
              <Paperclip size={18} aria-hidden />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Content side="top" align="start" sideOffset={6} className="z-50 w-48 rounded-lg border border-border bg-raised p-1 shadow-xl">
                <Menu.Item
                  onSelect={() => { sendFile({ name: "photo.png", fileType: "png", sizeKb: 980, isImage: true }, me); push({ title: t("messaging.attachMock"), tone: "positive" }); }}
                  className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface"
                >
                  <ImageSquare size={18} aria-hidden /> {t("messaging.attachPhoto")}
                </Menu.Item>
                <Menu.Item
                  onSelect={() => { sendFile({ name: "document.pdf", fileType: "pdf", sizeKb: 320 }, me); push({ title: t("messaging.attachMock"), tone: "positive" }); }}
                  className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface"
                >
                  <FileText size={18} aria-hidden /> {t("messaging.attachFile")}
                </Menu.Item>
              </Menu.Content>
            </Menu.Portal>
          </Menu.Root>

          <GifStickerPicker onPick={(stk) => sendSticker(stk, me)} />

          <Menu.Root>
            <Menu.Trigger className="inline-flex h-11 w-11 items-center justify-center rounded-md text-fg hover:bg-surface" aria-label={t("messaging.canned")}>
              <Lightning size={18} aria-hidden />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Content side="top" align="start" sideOffset={6} className="z-50 w-72 rounded-lg border border-border bg-raised p-1 shadow-xl">
                <Menu.Label className="px-2 py-1 text-base font-semibold text-muted">{t("messaging.canned")}</Menu.Label>
                {CANNED.map((c) => (
                  <Menu.Item key={c.title} onSelect={() => update(c.body)} className="cursor-pointer rounded-md px-2 py-2 text-base outline-none data-[highlighted]:bg-surface">
                    <div className="font-medium text-fg">{c.title}</div>
                    <div className="truncate text-muted">{c.body}</div>
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Portal>
          </Menu.Root>

          <IconButton label={t("messaging.record")} onClick={() => { sendVoice(12, me); push({ title: t("messaging.voiceMock"), tone: "positive" }); }}>
            <Microphone size={18} aria-hidden />
          </IconButton>

          <IconButton label={t("messaging.poll.create")} onClick={() => setPollOpen(true)}>
            <ChartBar size={18} aria-hidden />
          </IconButton>

          <IconButton
            label={t("messaging.silent")}
            variant={silent ? "primary" : "ghost"}
            onClick={() => setSilent((v) => !v)}
          >
            <BellSlash size={18} aria-hidden />
          </IconButton>

          <IconButton
            label={t("messaging.schedule")}
            onClick={() => { if (!text.trim()) return; scheduleMessage(text, me); push({ title: t("messaging.scheduledMock"), tone: "positive" }); setText(""); }}
          >
            <Clock size={18} aria-hidden />
          </IconButton>

          <IconButton label={t("messaging.aiDraft")} onClick={() => ask(t("messaging.ai.draft"), ctxName)}>
            <Sparkle size={18} aria-hidden />
          </IconButton>

          <Menu.Root>
            <Menu.Trigger className="inline-flex h-11 w-11 items-center justify-center rounded-md text-fg hover:bg-surface disabled:opacity-40" aria-label={t("messaging.rewrite")} disabled={!text.trim()}>
              <MagicWand size={18} aria-hidden />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Content side="top" align="end" sideOffset={6} className="z-50 w-48 rounded-lg border border-border bg-raised p-1 shadow-xl">
                <Menu.Label className="px-2 py-1 text-base font-semibold text-muted">{t("messaging.rewrite")}</Menu.Label>
                {(["professional", "friendly", "concise"] as RewriteTone[]).map((tone) => (
                  <Menu.Item key={tone} onSelect={() => update(rewriteMessage(text, tone))} className="cursor-pointer rounded-md px-2 py-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
                    {t(`messaging.rewriteTone.${tone}`)}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Portal>
          </Menu.Root>
          </div>

          <span className="hidden shrink-0 text-base text-muted sm:block">{t("messaging.enterHint")}</span>
          <IconButton label={t("messaging.send")} variant="primary" onClick={submit} disabled={!text.trim()}>
            <PaperPlaneRight size={18} aria-hidden />
          </IconButton>
        </div>
      </div>

      <ScheduledTray open={trayOpen} onOpenChange={setTrayOpen} />
      <CreatePollDialog open={pollOpen} onOpenChange={setPollOpen} />
    </div>
  );
}

function FmtBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-fg">
      {children}
    </button>
  );
}

function SmartRepliesInline({ onPick }: { onPick: (s: string) => void }) {
  const { t } = useTranslation();
  const items = t("messaging.smart", { returnObjects: true }) as unknown as string[];
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto px-1 pb-2">
      <span className="inline-flex shrink-0 items-center gap-1 text-base text-muted">
        <Sparkle size={14} className="text-accent" aria-hidden />
        {t("messaging.smartReplies")}
      </span>
      {items.map((s, i) => (
        <button key={i} onClick={() => onPick(s)} className="shrink-0 rounded-full border border-border bg-surface px-3 py-1 text-base text-fg hover:bg-raised">
          {s}
        </button>
      ))}
    </div>
  );
}
