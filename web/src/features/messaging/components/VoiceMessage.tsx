import * as React from "react";
import { Play, Pause } from "@/lib/icons";
import { useTranslation } from "react-i18next";
import { voiceWaveform } from "../chat";

const SPEEDS = [1, 1.5, 2];

/** Mock voice message with playback-speed control (WhatsApp/Telegram). */
export function VoiceMessage({ seconds }: { seconds: number }) {
  const { t } = useTranslation();
  const [playing, setPlaying] = React.useState(false);
  const [speedIdx, setSpeedIdx] = React.useState(0);
  const mm = Math.floor(seconds / 60);
  const ss = (seconds % 60).toString().padStart(2, "0");
  // Deterministic waveform per clip (shared chat-domain util).
  const bars = voiceWaveform(`v${seconds}`, 15);

  return (
    <div className="flex items-center gap-2" role="group" aria-label={t("messaging.voiceMessage")}>
      <button
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? t("messaging.pause") : t("messaging.play")}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg"
      >
        {playing ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
      </button>
      <div className="flex h-6 items-center gap-0.5" aria-hidden>
        {bars.map((h, i) => (
          <span key={i} style={{ height: `${Math.round(h * 22) + 4}px` }} className="w-1 rounded-full bg-muted" />
        ))}
      </div>
      <span className="text-base text-muted">
        {mm}:{ss}
      </span>
      <button
        onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
        aria-label={t("messaging.playbackSpeed")}
        className="rounded-md border border-border px-1.5 text-base text-muted hover:bg-surface"
      >
        {SPEEDS[speedIdx]}×
      </button>
    </div>
  );
}
