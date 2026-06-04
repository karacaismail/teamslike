import { useTranslation } from "react-i18next";
import {
  Microphone,
  MicrophoneSlash,
  VideoCamera,
  VideoCameraSlash,
  Aperture,
  Sparkle,
} from "@/lib/icons";
import { useMeetingStore } from "../store";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

function Toggle({
  on,
  label,
  onClick,
  children,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      className={cn(
        "inline-flex h-12 w-12 items-center justify-center rounded-full",
        on ? "border border-border bg-raised text-fg hover:bg-surface" : "bg-danger text-white",
      )}
    >
      {children}
    </button>
  );
}

export function PreJoin() {
  const { t } = useTranslation();
  const s = useMeetingStore();
  const name = useAuthStore((a) => a.principal?.displayName ?? "You");

  return (
    <div className="flex h-full items-center justify-center bg-bg p-6">
      <div className="w-full max-w-3xl">
        <h1 className="mb-1 text-2xl font-bold text-fg">{s.activeTitle}</h1>
        <p className="mb-4 text-base text-muted">{t("meetings.prejoinSubtitle")}</p>

        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-border bg-raised">
          {s.camOn ? (
            <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-surface" aria-hidden />
          ) : null}
          <Avatar name={name} size={104} />
          {!s.camOn ? (
            <div className="absolute bottom-3 left-3 rounded-md bg-overlay px-3 py-1 text-base text-white">
              {t("meetings.cameraOff")}
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
            <Toggle on={s.micOn} label={s.micOn ? t("meetings.mute") : t("meetings.unmute")} onClick={s.toggleMic}>
              {s.micOn ? <Microphone size={22} aria-hidden /> : <MicrophoneSlash size={22} aria-hidden />}
            </Toggle>
            <Toggle on={s.camOn} label={s.camOn ? t("meetings.stopCam") : t("meetings.startCam")} onClick={s.toggleCam}>
              {s.camOn ? <VideoCamera size={22} aria-hidden /> : <VideoCameraSlash size={22} aria-hidden />}
            </Toggle>
            <Toggle on={s.blurOn} label={t("meetings.blur")} onClick={s.toggleBlur}>
              <Aperture size={22} aria-hidden />
            </Toggle>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-base text-muted">{t("meetings.camera")}</span>
            <select className="h-11 w-full rounded-md border border-border bg-raised px-3 text-base text-fg" aria-label={t("meetings.camera")}>
              <option>FaceTime HD Camera</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-base text-muted">{t("meetings.microphone")}</span>
            <select className="h-11 w-full rounded-md border border-border bg-raised px-3 text-base text-fg" aria-label={t("meetings.microphone")}>
              <option>MacBook Pro Microphone</option>
            </select>
          </label>
        </div>

        <button
          onClick={s.toggleAiCompanion}
          aria-pressed={s.aiCompanion}
          className={cn(
            "mt-3 flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-base",
            s.aiCompanion ? "border-accent bg-surface text-fg" : "border-border bg-raised text-muted",
          )}
        >
          <Sparkle size={18} className="text-accent" aria-hidden />
          <span className="flex-1">{t("meetings.aiCompanion")}</span>
          <span className="text-base">{s.aiCompanion ? t("meetings.on") : t("meetings.off")}</span>
        </button>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={s.leave}>
            {t("meetings.cancel")}
          </Button>
          <Button size="lg" onClick={s.join}>
            {t("meetings.joinNow")}
          </Button>
        </div>
      </div>
    </div>
  );
}
