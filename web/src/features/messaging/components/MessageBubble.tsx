import * as React from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { useTranslation } from "react-i18next";
import {
  Smiley,
  ChatCircleText,
  Translate,
  DotsThree,
  Copy,
  Sparkle,
  CircleNotch,
  PushPin,
  BookmarkSimple,
  Warning,
  PencilSimple,
  Trash,
  ArrowBendUpLeft,
  ShareFat,
  LockKey,
  BellSlash,
  Info,
  VideoCamera,
  Timer,
  Eye,
  Alarm,
} from "@/lib/icons";
import { useMessagingStore } from "../store";
import { memberName } from "../members";
import { renderRich } from "../rich";
import { QUICK_REACTIONS, type Message } from "../types";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { useAskCopilot } from "@/lib/useCopilot";
import { useJoinCall } from "@/features/integration";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, Button } from "@/components/ui/primitives";
import { relTime } from "@/lib/time";
import { cn } from "@/lib/cn";
import { DeliveryTicks } from "./DeliveryTicks";
import { VoiceMessage } from "./VoiceMessage";
import { PollMessage } from "./PollMessage";
import { FileMessage } from "./FileMessage";
import { LinkPreview, firstUrl } from "./LinkPreview";
import { ForwardDialog } from "./ForwardDialog";
import { MessageInfoDialog } from "./MessageInfoDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function MessageBubble({
  message,
  grouped,
  repliesCount,
  inThread = false,
  bubble = false,
}: {
  message: Message;
  grouped: boolean;
  repliesCount: number;
  inThread?: boolean;
  bubble?: boolean;
}) {
  const { t } = useTranslation();
  const me = useAuthStore((s) => s.principal?.id ?? "usr_1");
  const store = useMessagingStore();
  const {
    toggleReaction,
    translate,
    openThread,
    togglePin,
    toggleSave,
    toggleImportant,
    setMessagePriority,
    deleteForEveryone,
    deleteForMe,
    restoreForMe,
    editMessage,
    setReplyTarget,
  } = store;
  const [confirmDeleteAll, setConfirmDeleteAll] = React.useState(false);
  const quoted = useMessagingStore((s) =>
    message.replyToId ? s.messages.find((m) => m.id === message.replyToId) : undefined,
  );
  const channel = useMessagingStore((s) => s.channels.find((c) => c.id === message.channelId));
  const push = useToastStore((s) => s.push);
  const ask = useAskCopilot();
  const joinCall = useJoinCall();

  const [showTranslation, setShowTranslation] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(message.body);
  const [forwardOpen, setForwardOpen] = React.useState(false);
  const [infoOpen, setInfoOpen] = React.useState(false);

  const own = message.authorId === me;
  const name = message.authorName ?? memberName(message.authorId);

  if (message.hiddenForMe) return null;

  if (message.deleted) {
    return (
      <div className={cn("px-4 py-1 text-base italic text-muted", bubble && own && "text-right")}>
        {t("messaging.deleted")}
      </div>
    );
  }

  if (message.kind === "system") {
    return (
      <div className="my-2 flex items-center justify-center gap-2 px-4 text-base text-muted">
        <LockKey size={14} aria-hidden />
        {t(`messaging.system.${message.systemKey ?? "e2ee"}`)}
      </div>
    );
  }

  if (message.kind === "call") {
    const title = channel ? (channel.kind === "dm" ? channel.name : `#${channel.name}`) : "";
    return (
      <div className="my-2 flex items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2">
          <VideoCamera size={22} className="text-accent" aria-hidden />
          <span className="text-base text-fg">{t("messaging.callStarted")}</span>
          <Button onClick={() => joinCall(message.channelId, message.topicId, title)}>
            {t("messaging.joinCall")}
          </Button>
        </div>
      </div>
    );
  }

  const isNote = message.kind === "note";

  const onTranslate = () => {
    if (!message.translated) {
      translate(message.id);
      setShowTranslation(true);
    } else setShowTranslation((v) => !v);
  };

  const bodyNode = editing ? (
    <div>
      <textarea
        rows={2}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label={t("messaging.edit")}
        className="w-full resize-none rounded-md border border-border bg-bg p-2 text-base text-fg outline-none"
      />
      <div className="mt-1 flex gap-2">
        <Button onClick={() => { editMessage(message.id, draft); setEditing(false); }}>
          {t("messaging.saveEdit")}
        </Button>
        <Button variant="ghost" onClick={() => setEditing(false)}>
          {t("messaging.cancel")}
        </Button>
      </div>
    </div>
  ) : message.kind === "voice" ? (
    <VoiceMessage seconds={message.voiceSec ?? 0} />
  ) : message.kind === "poll" && message.poll ? (
    <PollMessage message={message} />
  ) : message.kind === "file" && message.file ? (
    <FileMessage file={message.file} />
  ) : message.kind === "sticker" ? (
    <div className="text-5xl leading-none" role="img" aria-label={t("messaging.sticker")}>
      {message.sticker}
    </div>
  ) : (
    <div className="text-base text-fg">{renderRich(message.body)}</div>
  );

  const previewUrl = !message.kind || message.kind === "text" ? firstUrl(message.body) : null;
  const linkPreview = previewUrl ? <LinkPreview url={previewUrl} /> : null;

  const metaExtras = (
    <>
      {message.ephemeral ? <Timer size={12} aria-label={t("messaging.ephemeral")} /> : null}
      {message.viewCount ? (
        <span className="inline-flex items-center gap-0.5">
          <Eye size={12} aria-hidden />
          {message.viewCount >= 1000 ? `${(message.viewCount / 1000).toFixed(1)}k` : message.viewCount}
        </span>
      ) : null}
    </>
  );

  const remindItem = (
    <Menu.Item
      onSelect={() => {
        push({ title: t("messaging.reminderSet"), tone: "positive" });
        setTimeout(
          () => push({ title: t("messaging.reminder"), description: message.body.slice(0, 60) || t("messaging.voiceMessage") }),
          6000,
        );
      }}
      className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface"
    >
      <Alarm size={18} aria-hidden /> {t("messaging.remindMe")}
    </Menu.Item>
  );

  const reactionsRow =
    message.reactions.length > 0 ? (
      <div className={cn("mt-1 flex flex-wrap gap-1", bubble && own && "justify-end")}>
        {message.reactions.map((r) => {
          const mine = r.userIds.includes(me);
          return (
            <button
              key={r.emoji}
              onClick={() => toggleReaction(message.id, r.emoji, me)}
              aria-pressed={mine}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-full border px-2 text-base",
                mine ? "border-accent bg-surface text-accent" : "border-border bg-raised text-fg",
              )}
            >
              <span aria-hidden>{r.emoji}</span>
              <span>{r.userIds.length}</span>
            </button>
          );
        })}
      </div>
    ) : null;

  const toolbar = (
    <div className="absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-md border border-border bg-raised p-0.5 opacity-0 shadow-sm transition-opacity pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto motion-reduce:transition-none [@media(pointer:coarse)]:opacity-100 [@media(pointer:coarse)]:pointer-events-auto">
      <Menu.Root>
        <Menu.Trigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-fg" aria-label={t("messaging.react")}>
          <Smiley size={18} aria-hidden />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content sideOffset={4} className="z-50 flex gap-1 rounded-md border border-border bg-raised p-1 shadow-xl">
            {QUICK_REACTIONS.map((emoji) => (
              <Menu.Item key={emoji} onSelect={() => toggleReaction(message.id, emoji, me)} className="cursor-pointer rounded-md px-2 py-1 text-lg outline-none data-[highlighted]:bg-surface">
                <span aria-hidden>{emoji}</span>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>

      <button onClick={() => setReplyTarget(message.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-fg" aria-label={t("messaging.reply")}>
        <ArrowBendUpLeft size={18} aria-hidden />
      </button>
      {!inThread ? (
        <button onClick={() => openThread(message.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-fg" aria-label={t("messaging.replyInThread")}>
          <ChatCircleText size={18} aria-hidden />
        </button>
      ) : null}
      <button onClick={onTranslate} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-fg" aria-label={t("messaging.translate")}>
        <Translate size={18} aria-hidden />
      </button>

      <Menu.Root>
        <Menu.Trigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-fg" aria-label={t("messaging.moreActions")}>
          <DotsThree size={18} aria-hidden />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content align="end" sideOffset={4} className="z-50 w-56 rounded-md border border-border bg-raised p-1 shadow-xl">
            <Menu.Item onSelect={() => setForwardOpen(true)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
              <ShareFat size={18} aria-hidden /> {t("messaging.forward")}
            </Menu.Item>
            <Menu.Item onSelect={() => togglePin(message.id)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
              <PushPin size={18} aria-hidden /> {message.pinned ? t("messaging.unpin") : t("messaging.pin")}
            </Menu.Item>
            <Menu.Item onSelect={() => toggleSave(message.id)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
              <BookmarkSimple size={18} aria-hidden /> {message.saved ? t("messaging.unsave") : t("messaging.save")}
            </Menu.Item>
            <Menu.Item onSelect={() => toggleImportant(message.id)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
              <Warning size={18} aria-hidden /> {t("messaging.markImportant")}
            </Menu.Item>
            <Menu.Item onSelect={() => setMessagePriority(message.id, message.priority === "urgent" ? "normal" : "urgent")} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
              <Warning size={18} weight="fill" aria-hidden /> {message.priority === "urgent" ? t("messaging.msgPriority.normal") : t("messaging.markUrgent")}
            </Menu.Item>
            <Menu.Item onSelect={() => setInfoOpen(true)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
              <Info size={18} aria-hidden /> {t("messaging.messageInfo")}
            </Menu.Item>
            <Menu.Item onSelect={() => ask(t("messaging.ai.summarizeFromHere"), name)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
              <Sparkle size={18} aria-hidden /> {t("messaging.summarizeFromHere")}
            </Menu.Item>
            <Menu.Item onSelect={() => { void navigator.clipboard?.writeText(message.body); push({ title: t("messaging.copied"), tone: "positive" }); }} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
              <Copy size={18} aria-hidden /> {t("messaging.copy")}
            </Menu.Item>
            {remindItem}
            <Menu.Separator className="my-1 h-px bg-border" />
            {own ? (
              <Menu.Item onSelect={() => { setDraft(message.body); setEditing(true); }} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
                <PencilSimple size={18} aria-hidden /> {t("messaging.edit")}
              </Menu.Item>
            ) : null}
            <Menu.Item onSelect={() => { deleteForMe(message.id); push({ title: t("messaging.deletedForMe"), tone: "neutral", action: { label: t("common.undo"), onAction: () => restoreForMe(message.id) } }); }} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
              <Trash size={18} aria-hidden /> {t("messaging.deleteForMe")}
            </Menu.Item>
            {own ? (
              <Menu.Item onSelect={() => setConfirmDeleteAll(true)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-danger outline-none data-[highlighted]:bg-surface">
                <Trash size={18} aria-hidden /> {t("messaging.deleteForEveryone")}
              </Menu.Item>
            ) : null}
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );

  const dialogs = (
    <>
      {forwardOpen ? <ForwardDialog open={forwardOpen} onOpenChange={setForwardOpen} messageId={message.id} /> : null}
      {infoOpen ? <MessageInfoDialog open={infoOpen} onOpenChange={setInfoOpen} message={message} /> : null}
      <ConfirmDialog
        open={confirmDeleteAll}
        onOpenChange={setConfirmDeleteAll}
        title={t("messaging.deleteForEveryone")}
        body={t("messaging.deleteForEveryoneConfirm")}
        confirmLabel={t("common.delete")}
        onConfirm={() => deleteForEveryone(message.id)}
      />
    </>
  );

  const ctxItemClass = "flex h-9 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface";
  /** Right-click app context menu — mirrors the hover ⋯ menu's primary actions. */
  const ctxItems = (
    <>
      <ContextMenu.Item onSelect={() => setReplyTarget(message.id)} className={ctxItemClass}>
        <ArrowBendUpLeft size={16} aria-hidden /> {t("messaging.reply")}
      </ContextMenu.Item>
      <ContextMenu.Item onSelect={() => setForwardOpen(true)} className={ctxItemClass}>
        <ShareFat size={16} aria-hidden /> {t("messaging.forward")}
      </ContextMenu.Item>
      <ContextMenu.Item onSelect={() => togglePin(message.id)} className={ctxItemClass}>
        <PushPin size={16} aria-hidden /> {message.pinned ? t("messaging.unpin") : t("messaging.pin")}
      </ContextMenu.Item>
      <ContextMenu.Item onSelect={() => toggleSave(message.id)} className={ctxItemClass}>
        <BookmarkSimple size={16} aria-hidden /> {message.saved ? t("messaging.unsave") : t("messaging.save")}
      </ContextMenu.Item>
      <ContextMenu.Item onSelect={() => toggleImportant(message.id)} className={ctxItemClass}>
        <Warning size={16} aria-hidden /> {t("messaging.markImportant")}
      </ContextMenu.Item>
      <ContextMenu.Item onSelect={() => { void navigator.clipboard?.writeText(message.body); push({ title: t("messaging.copied"), tone: "positive" }); }} className={ctxItemClass}>
        <Copy size={16} aria-hidden /> {t("messaging.copy")}
      </ContextMenu.Item>
      <ContextMenu.Separator className="my-1 h-px bg-border" />
      <ContextMenu.Item onSelect={() => { deleteForMe(message.id); push({ title: t("messaging.deletedForMe"), tone: "neutral", action: { label: t("common.undo"), onAction: () => restoreForMe(message.id) } }); }} className={ctxItemClass}>
        <Trash size={16} aria-hidden /> {t("messaging.deleteForMe")}
      </ContextMenu.Item>
      {own ? (
        <ContextMenu.Item onSelect={() => setConfirmDeleteAll(true)} className={cn(ctxItemClass, "text-danger")}>
          <Trash size={16} aria-hidden /> {t("messaging.deleteForEveryone")}
        </ContextMenu.Item>
      ) : null}
    </>
  );

  // ── WhatsApp/Telegram bubble layout (DMs) ──────────────────────────────
  if (bubble) {
    return (
      <div className={cn("flex px-4 py-0.5", own ? "justify-end" : "justify-start")}>
        <div role="article" tabIndex={0} aria-label={`${name}: ${message.body || t("messaging.voiceMessage")}`} className="group relative max-w-[80%] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          {!own && !grouped ? (
            <div className="mb-0.5 text-base font-semibold text-accent">{name}</div>
          ) : null}
          <div className={cn("rounded-2xl px-3 py-2", own ? "bg-accent text-accent-fg" : "bg-raised text-fg")}>
            {message.forwardedFrom ? (
              <div className={cn("mb-1 inline-flex items-center gap-1 text-base", own ? "text-accent-fg/80" : "text-muted")}>
                <ShareFat size={14} aria-hidden /> {t("messaging.forwardedFrom", { name: message.forwardedFrom })}
              </div>
            ) : null}
            {quoted ? (
              <div className={cn("mb-1 rounded-md border-l-2 px-2 py-1 text-base", own ? "border-accent-fg/60 bg-accent-fg/10" : "border-accent bg-surface")}>
                <span className="font-medium">{quoted.authorName ?? memberName(quoted.authorId)}</span>
                <span className="ml-2 opacity-80">{(quoted.body || t("messaging.voiceMessage")).slice(0, 80)}</span>
              </div>
            ) : null}
            {bodyNode}
            {linkPreview}
            <div className={cn("mt-0.5 flex items-center justify-end gap-1 text-base", own ? "text-accent-fg/80" : "text-muted")}>
              {message.silent ? <BellSlash size={12} aria-label={t("messaging.silent")} /> : null}
              <span>{relTime(t, message.tMinutes)}</span>
              {message.edited ? <span>({t("messaging.edited")})</span> : null}
              {own && message.status ? <DeliveryTicks status={message.status} /> : null}
              {metaExtras}
            </div>
          </div>
          {reactionsRow}
          {toolbar}
        </div>
        {dialogs}
      </div>
    );
  }

  // ── Slack/Teams channel list layout ───────────────────────────────────
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
    <div role="article" tabIndex={0} aria-label={`${name}: ${message.body || t("messaging.voiceMessage")}`} className={cn("group relative flex gap-3 px-4 py-1.5 hover:bg-surface focus-within:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent", message.important && "border-l-2 border-danger bg-surface", isNote && "border-l-4 border-warning bg-surface")}>
      <div className="w-9 shrink-0">
        {!grouped ? (
          <Avatar name={name} size={36} className="mt-0.5" />
        ) : (
          <span className="block pt-1 text-right text-base text-muted opacity-0 group-hover:opacity-100">{relTime(t, message.tMinutes)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {!grouped ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-fg">{name}</span>
            <span className="text-base text-muted">{relTime(t, message.tMinutes)}</span>
            {message.edited ? <span className="text-base text-muted">({t("messaging.edited")})</span> : null}
            {message.silent ? <BellSlash size={14} className="text-muted" aria-label={t("messaging.silent")} /> : null}
            {message.pinned ? <PushPin size={14} weight="fill" className="text-accent" aria-label={t("messaging.pinned")} /> : null}
            {message.saved ? <BookmarkSimple size={14} weight="fill" className="text-accent" aria-label={t("messaging.saved")} /> : null}
            {message.important ? <Badge tone="danger"><Warning size={14} aria-hidden /> {t("messaging.important")}</Badge> : null}
            {message.priority === "urgent" ? <Badge tone="danger"><Warning size={14} weight="fill" aria-hidden /> {t("messaging.msgPriority.urgent")}</Badge> : null}
            {own && message.status ? <DeliveryTicks status={message.status} /> : null}
            {metaExtras}
          </div>
        ) : null}
        {isNote ? <Badge tone="warning" className="mb-1">{t("messaging.noteBadge")}</Badge> : null}
        {message.forwardedFrom ? (
          <div className="mb-1 inline-flex items-center gap-1 text-base text-muted">
            <ShareFat size={14} aria-hidden /> {t("messaging.forwardedFrom", { name: message.forwardedFrom })}
          </div>
        ) : null}
        {quoted ? (
          <div className="mb-1 border-l-2 border-border bg-surface px-2 py-1 text-base">
            <span className="font-medium text-accent">{quoted.authorName ?? memberName(quoted.authorId)}</span>
            <span className="ml-2 text-muted">{(quoted.body || t("messaging.voiceMessage")).slice(0, 90)}</span>
          </div>
        ) : null}
        {bodyNode}
        {linkPreview}
        {message.translating ? (
          <div className="mt-1 inline-flex items-center gap-1 text-base text-muted">
            <CircleNotch size={16} className="animate-spin" aria-hidden /> {t("messaging.translating")}
          </div>
        ) : null}
        {showTranslation && message.translated && message.bodyAlt ? (
          <div className="mt-1 rounded-md border-l-2 border-accent bg-surface px-2 py-1 text-base text-fg">
            <span className="text-muted">{t("messaging.translated")}: </span>
            {message.bodyAlt}
          </div>
        ) : null}
        {reactionsRow}
        {!inThread && repliesCount > 0 ? (
          <button onClick={() => openThread(message.id)} className="mt-1 inline-flex items-center gap-1 text-base font-medium text-accent hover:underline">
            <ChatCircleText size={16} aria-hidden /> {t("messaging.replies", { n: repliesCount })}
          </button>
        ) : null}
      </div>
      {toolbar}
      {dialogs}
    </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="z-50 w-56 rounded-md border border-border bg-raised p-1 shadow-xl">
          {ctxItems}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
