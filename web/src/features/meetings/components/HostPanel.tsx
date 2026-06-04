import { useTranslation } from "react-i18next";
import {
  X,
  Lock,
  LockOpen,
  Users,
  MicrophoneSlash,
  HandPalm,
  Monitor,
  ChatCircle,
  PhoneDisconnect,
} from "@/lib/icons";
import { useMeetingStore } from "../store";
import { useToastStore } from "@/store/toastStore";
import { IconButton, Button } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { MeetParityPanel } from "./MeetParityPanel";
import { MeetGmPanel } from "./MeetGmPanel";
import { FacilitatorPanel } from "./FacilitatorPanel";

function SettingRow({
  label,
  on,
  onToggle,
  icon,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      className="flex h-11 w-full items-center gap-2 rounded-md border border-border px-3 text-base text-fg hover:bg-raised"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className={cn("text-base", on ? "text-accent" : "text-muted")}>
        {on ? t("meetings.on") : t("meetings.off")}
      </span>
    </button>
  );
}

export function HostPanel() {
  const { t } = useTranslation();
  const s = useMeetingStore();
  const push = useToastStore((x) => x.push);
  if (s.sidePanel !== "host") return null;

  return (
    <aside
      aria-label={t("meetings.hostControls")}
      className="flex w-80 shrink-0 flex-col border-l border-border bg-surface"
    >
      <header className="flex items-center justify-between border-b border-border p-3">
        <span className="text-base font-semibold text-fg">{t("meetings.hostControls")}</span>
        <IconButton label={t("meetings.closePanel")} onClick={() => s.setSidePanel("none")}>
          <X size={20} aria-hidden />
        </IconButton>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        <section className="space-y-2">
          <h3 className="text-base font-semibold text-muted">{t("meetings.meetingSettings")}</h3>
          <SettingRow
            label={t("meetings.lockMeeting")}
            on={s.locked}
            onToggle={s.toggleLock}
            icon={s.locked ? <Lock size={18} aria-hidden /> : <LockOpen size={18} aria-hidden />}
          />
          <SettingRow
            label={t("meetings.waitingRoom")}
            on={s.waitingRoom}
            onToggle={s.toggleWaitingRoom}
            icon={<Users size={18} aria-hidden />}
          />
          <SettingRow
            label={t("meetings.allowShare")}
            on={s.allowAttendeeShare}
            onToggle={s.toggleAttendeeShare}
            icon={<Monitor size={18} aria-hidden />}
          />
          <SettingRow
            label={t("meetings.allowChat")}
            on={s.allowAttendeeChat}
            onToggle={s.toggleAttendeeChat}
            icon={<ChatCircle size={18} aria-hidden />}
          />
        </section>

        <MeetParityPanel />
        <MeetGmPanel />
        <FacilitatorPanel />

        <section className="space-y-2">
          <h3 className="text-base font-semibold text-muted">{t("meetings.bulkActions")}</h3>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              s.muteAll();
              push({ title: t("meetings.mutedAll"), tone: "neutral" });
            }}
          >
            <MicrophoneSlash size={18} aria-hidden />
            {t("meetings.muteAll")}
          </Button>
          <Button variant="secondary" className="w-full" onClick={s.lowerAllHands}>
            <HandPalm size={18} aria-hidden />
            {t("meetings.lowerAllHands")}
          </Button>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold text-danger">{t("meetings.dangerZone")}</h3>
          <Button
            variant="danger"
            className="w-full"
            onClick={() => {
              s.endForAll();
              push({ title: t("meetings.endedForAll"), tone: "danger" });
            }}
          >
            <PhoneDisconnect size={18} aria-hidden />
            {t("meetings.endForAll")}
          </Button>
        </section>
      </div>
    </aside>
  );
}
