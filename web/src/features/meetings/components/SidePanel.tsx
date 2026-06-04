import * as React from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import {
  X,
  Microphone,
  MicrophoneSlash,
  VideoCamera,
  Hand,
  PaperPlaneRight,
  UsersThree,
  ClosedCaptioning,
  DotsThree,
  PushPin,
  Crown,
  UserMinus,
} from "@/lib/icons";
import { useMeetingStore } from "../store";
import { memberName } from "@/lib/identity";
import { useOpenLinkedChat, useLinkedChannelMessages, usePostToLinkedChannel } from "@/features/integration";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, Button, IconButton } from "@/components/ui/primitives";
import { relTime } from "@/lib/time";
import { cn } from "@/lib/cn";
import { BreakoutManager } from "./BreakoutManager";
import type { SidePanelTab } from "../types";

const TABS: { key: Exclude<SidePanelTab, "none">; labelKey: string }[] = [
  { key: "participants", labelKey: "meetings.participants" },
  { key: "chat", labelKey: "meetings.chat" },
  { key: "captions", labelKey: "meetings.captions" },
];

export function SidePanel() {
  const { t } = useTranslation();
  const s = useMeetingStore();
  const me = useAuthStore((a) => a.principal?.id ?? "usr_1");
  const [chatText, setChatText] = React.useState("");
  const [breakoutOpen, setBreakoutOpen] = React.useState(false);
  const captionsRef = React.useRef<HTMLDivElement>(null);

  // Meeting↔chat bridge: when started from a channel, the meeting chat IS that
  // channel's conversation (bidirectional).
  const linkedChannelId = s.linkedChannelId;
  const linkedTopicId = s.linkedTopicId;
  const openLinkedChat = useOpenLinkedChat();
  const bridgedChat = useLinkedChannelMessages(linkedTopicId);
  const postToLinkedChannel = usePostToLinkedChannel();
  const chatItems = linkedTopicId ? bridgedChat : s.chat;

  const submitChat = () => {
    if (!chatText.trim()) return;
    if (linkedTopicId && linkedChannelId)
      postToLinkedChannel(linkedChannelId, linkedTopicId, chatText, me);
    else s.sendChat(chatText, me);
    setChatText("");
  };

  React.useEffect(() => {
    const el = captionsRef.current;
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "end" });
  }, [s.captions]);

  if (s.sidePanel === "none" || s.sidePanel === "host" || s.sidePanel === "engage") return null;
  const tab = s.sidePanel;
  const self = s.participants.find((p) => p.isSelf);
  const isHost = self?.role === "host" || self?.role === "cohost";

  return (
    <aside
      aria-label={t("meetings.panel")}
      className="flex w-80 shrink-0 flex-col border-l border-border bg-surface"
    >
      <div className="flex items-center gap-1 border-b border-border p-2" role="tablist">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            role="tab"
            aria-selected={tab === tb.key}
            onClick={() => s.setSidePanel(tb.key)}
            className={cn(
              "h-10 flex-1 rounded-md text-base",
              tab === tb.key ? "bg-accent text-accent-fg" : "text-fg hover:bg-raised",
            )}
          >
            {t(tb.labelKey)}
          </button>
        ))}
        <IconButton label={t("meetings.closePanel")} onClick={() => s.setSidePanel("none")}>
          <X size={20} aria-hidden />
        </IconButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "participants" ? (
          <div className="space-y-3">
            {s.lobbyQueue.length > 0 ? (
              <div className="rounded-md border border-warning bg-raised p-2">
                <div className="mb-1 text-base font-semibold text-fg">
                  {t("meetings.lobbyWaiting")}
                </div>
                {s.lobbyQueue.map((l) => (
                  <div key={l.id} className="flex items-center gap-2 py-1">
                    <Avatar name={l.name} size={28} />
                    <span className="flex-1 truncate text-base text-fg">{l.name}</span>
                    <Button size="md" onClick={() => s.admit(l.id)}>
                      {t("meetings.admit")}
                    </Button>
                    <Button variant="ghost" onClick={() => s.denyLobby(l.id)}>
                      {t("meetings.deny")}
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}

            <Button variant="secondary" className="w-full" onClick={() => setBreakoutOpen(true)}>
              <UsersThree size={18} aria-hidden />
              {t("meetings.breakouts")}
            </Button>

            <ul className="space-y-1">
              {s.participants.map((p) => (
                <li key={p.id} className="flex items-center gap-2 rounded-md px-1 py-1">
                  <Avatar name={p.name} size={30} />
                  <span className="flex-1 truncate text-base text-fg">
                    {p.isSelf ? `${p.name} (${t("meetings.you")})` : p.name}
                  </span>
                  {p.role !== "attendee" ? (
                    <Badge tone="accent">{t(`meetings.role.${p.role}`)}</Badge>
                  ) : null}
                  {p.handRaised ? <Hand size={16} className="text-warning" aria-label={t("meetings.handRaised")} /> : null}
                  {p.camOn ? <VideoCamera size={16} className="text-muted" aria-hidden /> : null}
                  {s.spotlightId === p.id ? <PushPin size={14} weight="fill" className="text-warning" aria-label={t("meetings.spotlighted")} /> : null}
                  <button
                    onClick={() => s.toggleParticipantMute(p.id)}
                    aria-label={p.micOn ? t("meetings.muteParticipant") : t("meetings.unmuteParticipant")}
                    className="rounded-md p-1 text-muted hover:bg-raised"
                  >
                    {p.micOn ? <Microphone size={16} aria-hidden /> : <MicrophoneSlash size={16} className="text-danger" aria-hidden />}
                  </button>
                  {isHost && !p.isSelf ? (
                    <Menu.Root>
                      <Menu.Trigger aria-label={t("meetings.participantActions")} className="rounded-md p-1 text-muted hover:bg-raised">
                        <DotsThree size={18} aria-hidden />
                      </Menu.Trigger>
                      <Menu.Portal>
                        <Menu.Content align="end" sideOffset={4} className="z-50 w-48 rounded-md border border-border bg-raised p-1 shadow-xl">
                          <Menu.Item onSelect={() => s.toggleSpotlight(p.id)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
                            <PushPin size={16} aria-hidden /> {s.spotlightId === p.id ? t("meetings.unspotlight") : t("meetings.spotlight")}
                          </Menu.Item>
                          {p.handRaised ? (
                            <Menu.Item onSelect={() => s.toggleParticipantHand(p.id)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
                              <Hand size={16} aria-hidden /> {t("meetings.lowerHand")}
                            </Menu.Item>
                          ) : null}
                          {p.role === "attendee" ? (
                            <Menu.Item onSelect={() => s.makeCoHost(p.id)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface">
                              <Crown size={16} aria-hidden /> {t("meetings.makeCoHost")}
                            </Menu.Item>
                          ) : null}
                          <Menu.Item onSelect={() => s.removeParticipant(p.id)} className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-danger outline-none data-[highlighted]:bg-surface">
                            <UserMinus size={16} aria-hidden /> {t("meetings.removeParticipant")}
                          </Menu.Item>
                        </Menu.Content>
                      </Menu.Portal>
                    </Menu.Root>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {tab === "chat" ? (
          <div className="flex h-full flex-col">
            {linkedChannelId ? (
              <button
                onClick={() => openLinkedChat(linkedChannelId)}
                className="mb-2 inline-flex items-center gap-1 self-start rounded-md border border-border bg-raised px-2 py-1 text-base text-accent hover:bg-surface"
              >
                {t("meetings.openFullChat")}
              </button>
            ) : null}
            <ul className="flex-1 space-y-2">
              {chatItems.map((c) => (
                <li key={c.id}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-fg">{memberName(c.authorId)}</span>
                    <span className="text-base text-muted">{relTime(t, c.tMin)}</span>
                  </div>
                  <div className="text-base text-fg">{c.body}</div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {tab === "captions" ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant={s.captionsOn ? "primary" : "secondary"}
                onClick={s.toggleCaptions}
              >
                <ClosedCaptioning size={18} aria-hidden />
                {s.captionsOn ? t("meetings.captionsOn") : t("meetings.captionsOff")}
              </Button>
              <div className="inline-flex overflow-hidden rounded-md border border-border" role="group" aria-label={t("meetings.captionLang")}>
                {(["en", "tr"] as const).map((l) => (
                  <button
                    key={l}
                    aria-pressed={s.captionLang === l}
                    onClick={() => s.setCaptionLang(l)}
                    className={cn(
                      "h-9 px-3 text-base",
                      s.captionLang === l ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:bg-surface",
                    )}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-base text-muted">{t("meetings.captionsNote")}</p>
            <div className="space-y-2" aria-live="polite">
              {s.captions.length === 0 ? (
                <p className="text-base text-muted">{t("meetings.captionsEmpty")}</p>
              ) : (
                s.captions.map((c) => (
                  <div key={c.id} className="text-base">
                    <span className="font-semibold text-accent">{c.speaker}: </span>
                    <span className="text-fg">{c.text}</span>
                  </div>
                ))
              )}
              <div ref={captionsRef} />
            </div>
          </div>
        ) : null}
      </div>

      {tab === "chat" ? (
        <div className="border-t border-border p-2">
          <div className="flex items-end gap-2">
            <label htmlFor="mtg-chat" className="sr-only">
              {t("meetings.chatPlaceholder")}
            </label>
            <textarea
              id="mtg-chat"
              rows={1}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitChat();
                }
              }}
              placeholder={t("meetings.chatPlaceholder")}
              className="min-h-[2.75rem] flex-1 resize-none rounded-md border border-border bg-raised p-2 text-base text-fg outline-none placeholder:text-muted"
            />
            <IconButton
              label={t("meetings.send")}
              variant="primary"
              disabled={!chatText.trim()}
              onClick={submitChat}
            >
              <PaperPlaneRight size={18} aria-hidden />
            </IconButton>
          </div>
        </div>
      ) : null}

      <BreakoutManager open={breakoutOpen} onOpenChange={setBreakoutOpen} />
    </aside>
  );
}
