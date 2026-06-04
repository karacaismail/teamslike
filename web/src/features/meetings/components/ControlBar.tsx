import * as React from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import {
  Microphone,
  MicrophoneSlash,
  VideoCamera,
  VideoCameraSlash,
  Monitor,
  Hand,
  Smiley,
  PhoneDisconnect,
} from "@/lib/icons";
import { useMeetingStore } from "../store";
import { MEETING_REACTIONS } from "../types";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/cn";

type Tone = "default" | "active" | "danger";

const RoundBtn = React.forwardRef<
  HTMLButtonElement,
  {
    label: string;
    tone?: Tone;
    pressed?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
  }
>(({ label, tone = "default", pressed, onClick, children }, ref) => (
  <button
    ref={ref}
    aria-label={label}
    aria-pressed={pressed}
    title={label}
    onClick={onClick}
    className={cn(
      "inline-flex h-12 w-12 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      tone === "danger"
        ? "bg-danger text-white hover:opacity-90"
        : tone === "active"
          ? "bg-accent text-accent-fg"
          : "border border-border bg-raised text-fg hover:bg-surface",
    )}
  >
    {children}
  </button>
));
RoundBtn.displayName = "RoundBtn";

/**
 * Live meeting CONTROLS only — mic, camera, screen share, raise hand,
 * reactions, and leave. Secondary OPTIONS (captions, recording, layout,
 * whiteboard, stats, panels, host) live in the top bar's options menu
 * (MeetingTopActions), so this strip stays short and thumb-reachable on mobile.
 */
export function ControlBar() {
  const { t } = useTranslation();
  const s = useMeetingStore();
  const push = useToastStore((x) => x.push);

  const leave = () => {
    const aiOn = s.aiCompanion;
    s.leave();
    push({ title: t("meetings.leftToast"), tone: "neutral" });
    if (aiOn) {
      setTimeout(() => push({ title: t("meetings.aiSummaryToast"), tone: "positive" }), 600);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border bg-raised px-3 py-3">
      <RoundBtn
        label={s.micOn ? t("meetings.mute") : t("meetings.unmute")}
        tone={s.micOn ? "default" : "danger"}
        onClick={s.toggleMic}
      >
        {s.micOn ? <Microphone size={22} aria-hidden /> : <MicrophoneSlash size={22} aria-hidden />}
      </RoundBtn>

      <RoundBtn
        label={s.camOn ? t("meetings.stopCam") : t("meetings.startCam")}
        tone={s.camOn ? "default" : "danger"}
        onClick={s.toggleCam}
      >
        {s.camOn ? <VideoCamera size={22} aria-hidden /> : <VideoCameraSlash size={22} aria-hidden />}
      </RoundBtn>

      <RoundBtn
        label={s.screenSharing ? t("meetings.stopShare") : t("meetings.share")}
        tone={s.screenSharing ? "active" : "default"}
        pressed={s.screenSharing}
        onClick={s.toggleScreen}
      >
        <Monitor size={22} aria-hidden />
      </RoundBtn>

      <RoundBtn
        label={s.handRaised ? t("meetings.lowerHand") : t("meetings.raiseHand")}
        tone={s.handRaised ? "active" : "default"}
        pressed={s.handRaised}
        onClick={s.toggleHand}
      >
        <Hand size={22} aria-hidden />
      </RoundBtn>

      {/* Reactions */}
      <Menu.Root>
        <Menu.Trigger asChild>
          <RoundBtn label={t("meetings.react")}>
            <Smiley size={22} aria-hidden />
          </RoundBtn>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content
            side="top"
            sideOffset={8}
            className="z-50 flex gap-1 rounded-full border border-border bg-raised p-1 shadow-xl"
          >
            {MEETING_REACTIONS.map((e) => (
              <Menu.Item
                key={e}
                onSelect={() => s.sendReaction(e)}
                className="cursor-pointer rounded-full px-2 py-1 text-xl outline-none data-[highlighted]:bg-surface"
              >
                <span aria-hidden>{e}</span>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>

      <span className="mx-1 hidden h-8 w-px bg-border sm:block" aria-hidden />

      <RoundBtn label={t("meetings.leave")} tone="danger" onClick={leave}>
        <PhoneDisconnect size={22} aria-hidden />
      </RoundBtn>
    </div>
  );
}
