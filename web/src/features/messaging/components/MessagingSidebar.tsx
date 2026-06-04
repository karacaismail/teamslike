import * as React from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import { useTenantStore } from "@/store/tenantStore";
import {
  Hash,
  Lock,
  Megaphone,
  CaretDown,
  CaretRight,
  LockKey,
  BellSlash,
  PushPin,
  DotsThree,
  BookmarkSimple,
  Envelope,
  Plus,
  MagnifyingGlass,
  Archive,
  ChatCircle,
} from "@/lib/icons";
import { useMessagingStore } from "../store";
import { TOPICS } from "../data";
import { memberById } from "../members";
import { Avatar } from "@/components/ui/Avatar";
import { PresenceDot } from "@/components/ui/PresenceDot";
import { Badge, Button, EmptyState } from "@/components/ui/primitives";
import { SavedDrawer } from "./SavedDrawer";
import { CreateChannelDialog } from "./CreateChannelDialog";
import { NewDmDialog } from "./NewDmDialog";
import { GlobalSearchDialog } from "./GlobalSearchDialog";
import type { Channel, ChatFolder, ConversationStatus } from "../types";
import { cn } from "@/lib/cn";

const FOLDERS: ChatFolder[] = ["all", "unread", "dms", "channels"];
const statusTone: Record<ConversationStatus, string> = {
  open: "bg-warning",
  pending: "bg-accent",
  resolved: "bg-positive",
};

function Glyph({ kind }: { kind: Channel["kind"] }) {
  const Icon = kind === "private" ? Lock : kind === "broadcast" ? Megaphone : Hash;
  return <Icon size={18} aria-hidden />;
}

export function MessagingSidebar() {
  const { t } = useTranslation();
  const { channels, activeChannelId, activeTopicId, folder, setChannel, setTopic, setFolder, togglePinChat, toggleMuteChat, toggleMarkUnread, archiveChannel } =
    useMessagingStore();
  const [savedOpen, setSavedOpen] = React.useState(false);
  const [channelDialog, setChannelDialog] = React.useState(false);
  const [dmDialog, setDmDialog] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Channels are scoped to the active workspace (J5); DMs (untagged) are global.
  const workspaceId = useTenantStore((s) => s.workspaceId);
  const inWorkspace = (c: Channel) => c.workspaceId == null || c.workspaceId === workspaceId;

  const matchesFolder = (c: Channel) => {
    if (folder === "unread") return (c.unread ?? 0) > 0;
    if (folder === "dms") return c.kind === "dm";
    if (folder === "channels") return c.kind !== "dm";
    return true;
  };

  const pinned = channels.filter((c) => c.pinned && inWorkspace(c) && matchesFolder(c));
  const chans = channels.filter((c) => c.kind !== "dm" && !c.pinned && inWorkspace(c) && matchesFolder(c));
  const dms = channels.filter((c) => c.kind === "dm" && !c.pinned && matchesFolder(c));

  const ChatRow = ({ c }: { c: Channel }) => {
    const active = c.id === activeChannelId;
    const member = c.dmUserId ? memberById(c.dmUserId) : undefined;
    const isChannel = c.kind !== "dm";
    const topics = TOPICS.filter((tp) => tp.channelId === c.id);
    const hasTopics = isChannel && topics.length > 1;

    return (
      <div>
        <div
          className={cn(
            "flex h-11 items-center gap-1 rounded-md pr-1",
            active ? "bg-raised font-semibold text-fg" : "text-fg hover:bg-raised",
            c.archived && "opacity-60",
          )}
        >
          <button onClick={() => setChannel(c.id)} className="flex h-11 min-w-0 flex-1 items-center gap-2 px-2 text-left text-base">
            {hasTopics ? (active ? <CaretDown size={14} aria-hidden /> : <CaretRight size={14} aria-hidden />) : <span className="w-3.5" aria-hidden />}
            {isChannel ? (
              <Glyph kind={c.kind} />
            ) : (
              <span className="relative inline-block">
                <Avatar name={c.name} size={24} />
                {member ? <PresenceDot presence={member.presence} className="absolute -bottom-0.5 -right-0.5" /> : null}
              </span>
            )}
            <span className="truncate">{c.name}</span>
            {c.isCustomer && c.status ? (
              <span className={cn("inline-block h-2 w-2 rounded-full", statusTone[c.status])} aria-label={t(`messaging.status.${c.status}`)} />
            ) : null}
            {c.e2ee ? <LockKey size={12} className="text-positive" aria-hidden /> : null}
            {c.muted ? <BellSlash size={12} className="text-muted" aria-hidden /> : null}
            {c.kind === "broadcast" && c.subscribers ? (
              <span className="text-base text-muted">{(c.subscribers / 1000).toFixed(1)}k</span>
            ) : null}
          </button>

          {c.archived ? <Badge tone="neutral">{t("messaging.archived")}</Badge> : null}
          {c.label ? <Badge tone="neutral">{c.label}</Badge> : null}
          {c.unread ? <Badge tone="accent">{c.unread}</Badge> : null}

          <Menu.Root>
            <Menu.Trigger aria-label={t("messaging.chatActions")} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted opacity-0 hover:bg-surface focus-visible:opacity-100 group-hover:opacity-100">
              <DotsThree size={18} aria-hidden />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Content align="end" sideOffset={4} className="z-50 w-48 rounded-md border border-border bg-raised p-1 shadow-xl">
                <Menu.Item onSelect={() => togglePinChat(c.id)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
                  <PushPin size={18} aria-hidden /> {c.pinned ? t("messaging.unpinChat") : t("messaging.pinChat")}
                </Menu.Item>
                <Menu.Item onSelect={() => toggleMuteChat(c.id)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
                  <BellSlash size={18} aria-hidden /> {c.muted ? t("messaging.unmuteChat") : t("messaging.muteChat")}
                </Menu.Item>
                <Menu.Item onSelect={() => toggleMarkUnread(c.id)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
                  <Envelope size={18} aria-hidden /> {t("messaging.markUnread")}
                </Menu.Item>
                <Menu.Item onSelect={() => archiveChannel(c.id)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
                  <Archive size={18} aria-hidden /> {c.archived ? t("messaging.unarchive") : t("messaging.archive")}
                </Menu.Item>
              </Menu.Content>
            </Menu.Portal>
          </Menu.Root>
        </div>

        {active && hasTopics ? (
          <ul className="mb-1 ml-7 mt-1 space-y-0.5">
            {topics.map((tp) => (
              <li key={tp.id}>
                <button
                  onClick={() => setTopic(tp.id)}
                  aria-current={tp.id === activeTopicId}
                  className={cn("flex h-9 w-full items-center rounded-md px-2 text-base", tp.id === activeTopicId ? "bg-accent text-accent-fg" : "text-muted hover:bg-raised hover:text-fg")}
                >
                  <span className="truncate">{tp.title}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  };

  return (
    <nav aria-label={t("nav.messaging")} className="group flex w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface">
      {/* Actions + folders */}
      <div className="space-y-2 border-b border-border p-2">
        <div className="flex items-center gap-1">
          <span className="flex-1 px-1 text-base font-semibold text-fg">{t("nav.messaging")}</span>
          <Menu.Root>
            <Menu.Trigger aria-label={t("messaging.new")} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-raised">
              <Plus size={18} aria-hidden />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Content align="end" sideOffset={4} className="z-50 w-48 rounded-md border border-border bg-raised p-1 shadow-xl">
                <Menu.Item onSelect={() => setChannelDialog(true)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
                  <Hash size={18} aria-hidden /> {t("messaging.newChannel")}
                </Menu.Item>
                <Menu.Item onSelect={() => setDmDialog(true)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
                  <ChatCircle size={18} aria-hidden /> {t("messaging.newDm")}
                </Menu.Item>
              </Menu.Content>
            </Menu.Portal>
          </Menu.Root>
          <button onClick={() => setSearchOpen(true)} aria-label={t("messaging.searchAll")} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-raised">
            <MagnifyingGlass size={18} aria-hidden />
          </button>
          <button onClick={() => setSavedOpen(true)} aria-label={t("messaging.savedTitle")} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-raised">
            <BookmarkSimple size={18} aria-hidden />
          </button>
        </div>
        <div className="flex gap-1" role="tablist" aria-label={t("messaging.folders")}>
          {FOLDERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={folder === f}
              onClick={() => setFolder(f)}
              className={cn("h-9 flex-1 rounded-md text-base", folder === f ? "bg-accent text-accent-fg" : "text-muted hover:bg-raised")}
            >
              {t(`messaging.folder.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-3 p-3">
        {pinned.length > 0 ? (
          <div>
            <div className="flex items-center gap-1 px-2 pb-1 text-base font-semibold text-muted">
              <PushPin size={14} aria-hidden /> {t("messaging.pinnedChats")}
            </div>
            {pinned.map((c) => <ChatRow key={c.id} c={c} />)}
          </div>
        ) : null}

        {chans.length > 0 ? (
          <div>
            <div className="px-2 pb-1 text-base font-semibold text-muted">{t("messaging.channels")}</div>
            {chans.map((c) => <ChatRow key={c.id} c={c} />)}
          </div>
        ) : pinned.length === 0 && (folder === "all" || folder === "channels") ? (
          // Getting-started empty state (J10) — e.g. a workspace with no channels yet.
          <EmptyState
            icon={<Hash size={24} aria-hidden />}
            title={t("messaging.noChannelsTitle")}
            hint={t("messaging.noChannelsHint")}
            action={
              <Button onClick={() => setChannelDialog(true)}>
                <Plus size={16} aria-hidden /> {t("messaging.newChannel")}
              </Button>
            }
          />
        ) : null}

        {dms.length > 0 ? (
          <div>
            <div className="px-2 pb-1 text-base font-semibold text-muted">{t("messaging.dms")}</div>
            {dms.map((c) => <ChatRow key={c.id} c={c} />)}
          </div>
        ) : null}
      </div>

      <SavedDrawer open={savedOpen} onOpenChange={setSavedOpen} />
      <CreateChannelDialog open={channelDialog} onOpenChange={setChannelDialog} />
      <NewDmDialog open={dmDialog} onOpenChange={setDmDialog} />
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>
  );
}
