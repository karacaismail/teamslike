import type { ReactNode } from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import {
  Users,
  DotsThree,
  Record,
  SquaresFour,
  ChalkboardSimple,
  ChartBar,
  ShieldCheck,
  Sparkle,
  Check,
} from "@/lib/icons";
import { useMeetingStore } from "../store";
import { useAskCopilot } from "@/lib/useCopilot";
import { cn } from "@/lib/cn";

/**
 * Top-bar meeting OPTIONS — kept deliberately small so it doesn't duplicate the
 * side panel, which already has its own Participants / Chat / Captions tabs.
 *
 *  - One "Participants" button opens that panel (chat + captions live as its
 *    tabs, so they are NOT repeated here).
 *  - One "Options" (⋯) menu groups the rest: recording, layout, whiteboard,
 *    AI notes, engagement stats, host controls.
 *
 * Live controls (mic/cam/screen/hand/reactions/leave) stay in the bottom bar.
 */
function TopIcon({
  label,
  active,
  badge,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  badge?: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active ? "bg-accent text-accent-fg" : "text-fg hover:bg-surface",
      )}
    >
      {children}
      {badge != null && badge > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-accent-fg">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export function MeetingTopActions() {
  const { t } = useTranslation();
  const s = useMeetingStore();
  const ask = useAskCopilot();
  const self = s.participants.find((p) => p.isSelf);
  const isHost = self?.role === "host" || self?.role === "cohost";

  // The side panel (participants/chat/captions) is "open" for any of its tabs.
  const panelOpen = s.sidePanel === "participants" || s.sidePanel === "chat" || s.sidePanel === "captions";

  const itemCls =
    "flex h-10 cursor-pointer items-center justify-between gap-3 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface";
  const mark = (on: boolean) =>
    on ? <Check size={16} aria-hidden className="text-accent" /> : <span className="w-4" aria-hidden />;

  return (
    <div className="flex items-center gap-1">
      <TopIcon
        label={t("meetings.participants")}
        active={panelOpen}
        badge={s.participants.length}
        onClick={() => s.setSidePanel(s.sidePanel === "participants" ? "none" : "participants")}
      >
        <Users size={20} aria-hidden />
      </TopIcon>

      <Menu.Root>
        <Menu.Trigger asChild>
          <button
            type="button"
            aria-label={t("meetings.options")}
            title={t("meetings.options")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-fg hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <DotsThree size={24} weight="bold" aria-hidden />
          </button>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content
            align="end"
            sideOffset={6}
            className="z-50 w-56 rounded-lg border border-border bg-raised p-1 shadow-xl"
          >
            {/* Toggles keep the menu open (preventDefault) so several can flip. */}
            <Menu.Item className={itemCls} onSelect={(e) => { e.preventDefault(); s.toggleRecording(); }}>
              <span className="flex items-center gap-2">
                <Record size={18} aria-hidden weight={s.recording ? "fill" : "regular"} />
                {s.recording ? t("meetings.stopRecording") : t("meetings.record")}
              </span>
              {mark(s.recording)}
            </Menu.Item>

            <Menu.Item className={itemCls} onSelect={() => s.setLayout(s.layout === "grid" ? "speaker" : "grid")}>
              <span className="flex items-center gap-2"><SquaresFour size={18} aria-hidden /> {t("meetings.layout")}</span>
            </Menu.Item>

            <Menu.Item className={itemCls} onSelect={(e) => { e.preventDefault(); s.toggleWhiteboard(); }}>
              <span className="flex items-center gap-2"><ChalkboardSimple size={18} aria-hidden /> {t("meetings.whiteboard")}</span>
              {mark(s.whiteboardOpen)}
            </Menu.Item>

            <Menu.Item className={itemCls} onSelect={() => ask(t("meetings.ai.notes"), s.activeTitle)}>
              <span className="flex items-center gap-2"><Sparkle size={18} aria-hidden /> {t("meetings.aiNotes")}</span>
            </Menu.Item>

            <Menu.Item className={itemCls} onSelect={() => s.setSidePanel(s.sidePanel === "engage" ? "none" : "engage")}>
              <span className="flex items-center gap-2"><ChartBar size={18} aria-hidden /> {t("meetings.engage")}</span>
              {mark(s.sidePanel === "engage")}
            </Menu.Item>

            {isHost ? (
              <>
                <Menu.Separator className="my-1 h-px bg-border" />
                <Menu.Item className={itemCls} onSelect={() => s.setSidePanel(s.sidePanel === "host" ? "none" : "host")}>
                  <span className="flex items-center gap-2"><ShieldCheck size={18} aria-hidden /> {t("meetings.hostControls")}</span>
                  {mark(s.sidePanel === "host")}
                </Menu.Item>
              </>
            ) : null}
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
