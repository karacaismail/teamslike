import * as React from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import {
  Hash,
  Lock,
  Megaphone,
  ChatCircle,
  MagnifyingGlass,
  Sparkle,
  LockKey,
  VideoCamera,
  CaretDown,
  Info,
  Timer,
  Brain,
  UsersThree,
  BookmarkSimple,
  X,
} from "@/lib/icons";
import { useMessagingStore } from "../store";
import { TOPICS } from "../data";
import { useStartMeetingFromChannel, useJoinCall, useOpenIntelligence, useLinkedMeetingState } from "@/features/integration";
import { useAskCopilot } from "@/lib/useCopilot";
import { Button, Badge, IconButton } from "@/components/ui/primitives";
import type { ChannelKind, ConversationStatus } from "../types";
import { cn } from "@/lib/cn";

const STATUSES: ConversationStatus[] = ["open", "pending", "resolved"];
const statusTone: Record<ConversationStatus, "warning" | "accent" | "positive"> = {
  open: "warning",
  pending: "accent",
  resolved: "positive",
};

function KindGlyph({ kind }: { kind: ChannelKind }) {
  const Icon =
    kind === "private" ? Lock : kind === "shared" ? UsersThree : kind === "broadcast" ? Megaphone : kind === "dm" ? ChatCircle : Hash;
  return <Icon size={18} aria-hidden />;
}

export function ChannelHeader() {
  const { t } = useTranslation();
  const { channels, activeChannelId, activeTopicId, search, setSearch, setStatus, toggleDetails, detailsOpen, savedOnly, toggleSavedOnly } =
    useMessagingStore();
  const ask = useAskCopilot();
  const startMeeting = useStartMeetingFromChannel();
  const joinCall = useJoinCall();
  const openIntel = useOpenIntelligence();
  const { linkedChannelId: meetingLinked, phase: meetingPhase } = useLinkedMeetingState();

  const channel = channels.find((c) => c.id === activeChannelId);
  const topic = TOPICS.find((tp) => tp.id === activeTopicId);
  const isChannel = channel?.kind === "channel" || channel?.kind === "private";
  const title = isChannel ? `#${channel?.name}` : (channel?.name ?? "");
  const ctxName = isChannel ? `${title} / ${topic?.title ?? ""}` : title;
  const subtitle =
    channel?.kind === "broadcast"
      ? t("messaging.subscribers", { n: channel.subscribers ?? 0 })
      : isChannel
        ? topic?.title
        : t("messaging.directMessage");

  const ongoing = meetingLinked === activeChannelId && meetingPhase !== "idle";
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border bg-raised px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-lg font-semibold text-fg">
            {channel ? <KindGlyph kind={channel.kind} /> : null}
            <span className="truncate">{channel?.name}</span>
            {channel?.e2ee ? (
              <Badge tone="positive">
                <LockKey size={14} aria-hidden /> {t("messaging.e2ee")}
              </Badge>
            ) : null}
            {channel?.disappearing && channel.disappearing !== "off" ? (
              <Badge tone="warning">
                <Timer size={14} aria-hidden /> {t(`messaging.timer.${channel.disappearing}`)}
              </Badge>
            ) : null}
            {channel?.kind === "shared" ? (
              <Badge tone="accent">
                <UsersThree size={14} aria-hidden /> {channel.externalOrgs?.length ? channel.externalOrgs.join(", ") : t("messaging.sharedChannel")}
              </Badge>
            ) : null}
            {channel?.isCustomer && channel.status ? (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <button className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-0.5 text-base">
                    <Badge tone={statusTone[channel.status]}>{t(`messaging.status.${channel.status}`)}</Badge>
                    <CaretDown size={12} aria-hidden />
                  </button>
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Content align="start" sideOffset={6} className="z-50 w-40 rounded-md border border-border bg-raised p-1 shadow-xl">
                    {STATUSES.map((st) => (
                      <Menu.Item
                        key={st}
                        onSelect={() => setStatus(channel.id, st)}
                        className="flex h-10 cursor-pointer items-center rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface"
                      >
                        {t(`messaging.status.${st}`)}
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu.Portal>
              </Menu.Root>
            ) : null}
          </div>
          <div className="truncate text-base text-muted">{subtitle}</div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <MagnifyingGlass size={16} aria-hidden className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("messaging.search")}
              aria-label={t("messaging.search")}
              className="h-11 w-40 rounded-md border border-border bg-surface pl-8 pr-3 text-base text-fg outline-none placeholder:text-muted"
            />
          </div>
          <IconButton
            label={t("messaging.search")}
            variant={searchOpen ? "primary" : "ghost"}
            aria-expanded={searchOpen}
            className="sm:hidden"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <MagnifyingGlass size={20} aria-hidden />
          </IconButton>
          <Button variant="secondary" onClick={() => ask(t("messaging.ai.catchUp"), ctxName)}>
            <Sparkle size={18} aria-hidden />
            <span className="hidden sm:inline">{t("messaging.catchUp")}</span>
          </Button>
          {channel?.isCustomer ? (
            <Button variant="secondary" onClick={() => openIntel("src_support")}>
              <Brain size={18} aria-hidden />
              <span className="hidden sm:inline">{t("intel.analyze")}</span>
            </Button>
          ) : null}
          {channel && channel.kind !== "broadcast" ? (
            <Button onClick={() => startMeeting(activeChannelId, activeTopicId, title)}>
              <VideoCamera size={18} aria-hidden />
              <span className="hidden sm:inline">{t("messaging.startMeeting")}</span>
            </Button>
          ) : null}
          <IconButton
            label={t("messaging.savedOnly")}
            variant={savedOnly ? "primary" : "ghost"}
            onClick={toggleSavedOnly}
          >
            <BookmarkSimple size={20} aria-hidden />
          </IconButton>
          <IconButton
            label={t("messaging.details")}
            variant={detailsOpen ? "primary" : "ghost"}
            onClick={toggleDetails}
          >
            <Info size={20} aria-hidden />
          </IconButton>
        </div>
      </header>

      {searchOpen ? (
        <div className="flex items-center gap-2 border-b border-border bg-raised px-4 py-2 sm:hidden">
          <div className="relative flex-1">
            <MagnifyingGlass size={16} aria-hidden className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("messaging.search")}
              aria-label={t("messaging.search")}
              className="h-11 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-base text-fg outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <IconButton
            label={t("common.close")}
            variant="ghost"
            onClick={() => {
              setSearch("");
              setSearchOpen(false);
            }}
          >
            <X size={20} aria-hidden />
          </IconButton>
        </div>
      ) : null}

      {ongoing ? (
        <div className={cn("flex items-center gap-2 border-b border-border bg-surface px-4 py-2")}>
          <VideoCamera size={18} className="text-accent" aria-hidden />
          <span className="flex-1 text-base text-fg">{t("messaging.meetingOngoing")}</span>
          <Button onClick={() => joinCall(activeChannelId, activeTopicId, title)}>
            {t("messaging.joinCall")}
          </Button>
        </div>
      ) : null}
    </>
  );
}
