import * as React from "react";
import { useTranslation } from "react-i18next";
import { DeviceMobile, Waveform, Timer, UsersThree, Sparkle, Sun, SpeakerHigh, Television, ShieldCheck, MagnifyingGlass, FileText, Microphone, Crosshair, Smiley, ShieldWarning, PushPin, HandWaving, FrameCorners, MusicNotes, Webcam, IdentificationBadge } from "@/lib/icons";
import { useMeetingStore, type MeetFx } from "../store";
import { attendanceReport, breakoutCountdown, watermarkLabel, searchArchive, MEETING_ARCHIVE } from "../meetParity";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

const FX: { key: MeetFx; icon: React.ReactNode }[] = [
  { key: "portraitTouchUp", icon: <Sparkle size={18} aria-hidden /> },
  { key: "studioLook", icon: <Sun size={18} aria-hidden /> },
  { key: "adaptiveAudio", icon: <SpeakerHigh size={18} aria-hidden /> },
  { key: "liveSharing", icon: <Television size={18} aria-hidden /> },
  { key: "watermark", icon: <ShieldCheck size={18} aria-hidden /> },
  { key: "focusMode", icon: <Crosshair size={18} aria-hidden /> },
  { key: "avatars", icon: <Smiley size={18} aria-hidden /> },
  { key: "deepfakeDetection", icon: <ShieldWarning size={18} aria-hidden /> },
  { key: "pushToTalk", icon: <PushPin size={18} aria-hidden /> },
  { key: "gestureRecognition", icon: <HandWaving size={18} aria-hidden /> },
  { key: "immersiveShare", icon: <FrameCorners size={18} aria-hidden /> },
  { key: "musicMode", icon: <MusicNotes size={18} aria-hidden /> },
  { key: "aiFraming", icon: <Webcam size={18} aria-hidden /> },
  { key: "nameLabels", icon: <IdentificationBadge size={18} aria-hidden /> },
];

function Toggle({ label, on, onToggle, icon }: { label: string; on: boolean; onToggle: () => void; icon: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      className="flex h-11 w-full items-center gap-2 rounded-md border border-border px-3 text-base text-fg hover:bg-raised"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className={cn("text-base", on ? "text-accent" : "text-muted")}>{on ? t("meetings.on") : t("meetings.off")}</span>
    </button>
  );
}

/** Google-Meet parity: companion mode, noise cancellation, breakout timer, attendance. */
export function MeetParityPanel() {
  const { t } = useTranslation();
  const s = useMeetingStore();
  const [now, setNow] = React.useState(Date.now());
  const [qa, setQa] = React.useState("");
  const archive = searchArchive(MEETING_ARCHIVE, qa);

  React.useEffect(() => {
    if (!s.breakoutEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [s.breakoutEndsAt]);

  const invitedIds = [...s.participants.map((p) => p.id), ...s.lobbyQueue.map((l) => l.id)];
  const att = attendanceReport(invitedIds, s.participants.map((p) => p.id));
  const cd = s.breakoutEndsAt ? breakoutCountdown(s.breakoutEndsAt, now) : null;

  return (
    <section className="space-y-2">
      <h3 className="text-base font-semibold text-muted">{t("meetings.meetParity")}</h3>

      <Toggle label={t("meetings.companion")} on={s.companionMode} onToggle={s.toggleCompanion} icon={<DeviceMobile size={18} aria-hidden />} />
      <Toggle label={t("meetings.noiseCancellation")} on={s.noiseCancellation} onToggle={s.toggleNoiseCancellation} icon={<Waveform size={18} aria-hidden />} />

      <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-base">
        <Timer size={18} className="text-muted" aria-hidden />
        <span className="flex-1 text-fg">{t("meetings.breakoutTimer")}</span>
        {cd ? (
          <>
            <span className="tabular-nums text-accent" aria-live="polite">
              {cd.expired ? t("meetings.timerDone") : t("meetings.timerRemaining", { s: cd.remainingSec })}
            </span>
            <Button variant="ghost" onClick={s.clearBreakoutTimer}>{t("meetings.clearTimer")}</Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => s.startBreakoutTimer(5)}>{t("meetings.startTimer")}</Button>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-base">
        <UsersThree size={18} className="text-muted" aria-hidden />
        <span className="flex-1 text-fg">{t("meetings.attendance")}</span>
        <span className="text-muted">
          {t("meetings.attendanceStat", { present: att.present, invited: att.invited })} · {Math.round(att.rate * 100)}%
        </span>
      </div>

      {/* Capture & quality effects (Google Meet parity) */}
      <h3 className="pt-1 text-base font-semibold text-muted">{t("meetings.captureFx")}</h3>
      {FX.map(({ key, icon }) => (
        <Toggle key={key} label={t(`meetings.fx.${key}`)} on={s[key]} onToggle={() => s.toggleMeetFx(key)} icon={icon} />
      ))}
      {s.watermark ? (
        <p className="rounded-md border border-border px-3 py-1.5 text-base text-muted" aria-live="polite">
          {t("meetings.watermarkLabel")}: {watermarkLabel(t("meetings.you"), s.activeMeetingId ?? "mtg", s.recordSec)}
        </p>
      ) : null}

      {/* Searchable meeting archive (linked recap + transcript + recording) */}
      <h3 className="pt-1 text-base font-semibold text-muted">{t("meetings.archive")}</h3>
      <div className="relative">
        <MagnifyingGlass size={14} aria-hidden className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={qa}
          onChange={(e) => setQa(e.target.value)}
          placeholder={t("meetings.archiveSearch")}
          aria-label={t("meetings.archiveSearch")}
          className="h-10 w-full rounded-md border border-border bg-bg pl-7 pr-2 text-base text-fg outline-none placeholder:text-muted"
        />
      </div>
      <ul className="space-y-1">
        {archive.map((a) => (
          <li key={a.id} className="rounded-md border border-border px-3 py-1.5">
            <div className="flex items-center gap-2 text-base text-fg">
              <span className="flex-1 truncate">{a.title}</span>
              {a.hasRecording ? <Microphone size={13} className="text-muted" aria-hidden /> : null}
              {a.hasTranscript ? <FileText size={13} className="text-muted" aria-hidden /> : null}
            </div>
            <div className="truncate text-base text-muted">{a.summary}</div>
          </li>
        ))}
        {archive.length === 0 ? <li className="text-base text-muted">{t("meetings.archiveEmpty")}</li> : null}
      </ul>
    </section>
  );
}
