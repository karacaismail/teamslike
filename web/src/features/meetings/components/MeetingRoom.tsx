import * as React from "react";
import { useTranslation } from "react-i18next";
import { Record, Sparkle } from "@/lib/icons";
import { useMeetingStore } from "../store";
import { Stage } from "./Stage";
import { ControlBar } from "./ControlBar";
import { SidePanel } from "./SidePanel";
import { HostPanel } from "./HostPanel";
import { EngagePanel } from "./EngagePanel";
import { Whiteboard } from "./Whiteboard";
import { Button } from "@/components/ui/primitives";

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function MeetingRoom() {
  const { t } = useTranslation();
  const s = useMeetingStore();

  // Active-speaker rotation
  React.useEffect(() => {
    const id = setInterval(() => useMeetingStore.getState().rotateSpeaker(), 3200);
    return () => clearInterval(id);
  }, []);

  // Live captions stream
  React.useEffect(() => {
    if (!s.captionsOn) return;
    const id = setInterval(() => useMeetingStore.getState().pushCaption(), 2600);
    return () => clearInterval(id);
  }, [s.captionsOn]);

  // Recording timer
  React.useEffect(() => {
    if (!s.recording) return;
    const id = setInterval(() => useMeetingStore.getState().tickRecord(), 1000);
    return () => clearInterval(id);
  }, [s.recording]);

  const lastCaptions = s.captions.slice(-2);
  const lobby = s.lobbyQueue[0];

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col bg-bg">
        {/* Top bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-2">
          <span className="truncate text-base font-semibold text-fg">{s.activeTitle}</span>
          {s.recording ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger px-2 py-0.5 text-base text-white">
              <Record size={14} weight="fill" aria-hidden />
              {t("meetings.rec")} {fmt(s.recordSec)}
            </span>
          ) : null}
          <span className="ml-auto text-base text-muted">
            {t("meetings.participantCount", { n: s.participants.length })}
          </span>
          {s.aiCompanion ? (
            <span className="inline-flex items-center gap-1 text-base text-accent">
              <Sparkle size={14} weight="fill" aria-hidden />
              {t("meetings.aiCompanionShort")}
            </span>
          ) : null}
        </div>

        {/* Lobby banner */}
        {lobby ? (
          <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2">
            <span className="flex-1 truncate text-base text-fg">
              {t("meetings.lobbyBanner", { name: lobby.name })}
            </span>
            <Button onClick={() => s.admit(lobby.id)}>{t("meetings.admit")}</Button>
            <Button variant="ghost" onClick={() => s.denyLobby(lobby.id)}>
              {t("meetings.deny")}
            </Button>
          </div>
        ) : null}

        {/* Stage + overlays */}
        <div className="relative min-h-0 flex-1">
          <Stage />
          {s.whiteboardOpen ? <Whiteboard /> : null}

          {s.reactions.length > 0 ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-2">
              {s.reactions.map((r) => (
                <span key={r.id} className="text-3xl" aria-hidden>
                  {r.emoji}
                </span>
              ))}
            </div>
          ) : null}

          {s.captionsOn && lastCaptions.length > 0 ? (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit max-w-[90%] rounded-md bg-overlay px-3 py-2 text-center text-base text-white"
              aria-live="polite"
            >
              {lastCaptions.map((c) => (
                <div key={c.id}>
                  <span className="font-semibold">{c.speaker}: </span>
                  {c.text}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <ControlBar />
      </div>

      <SidePanel />
      <HostPanel />
      <EngagePanel />
    </div>
  );
}
