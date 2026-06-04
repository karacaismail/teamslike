import { useTranslation } from "react-i18next";
import { MicrophoneSlash, Hand, Monitor, PushPin } from "@/lib/icons";
import { useMeetingStore } from "../store";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import type { ConnectionQuality, Participant } from "../types";

const qualityTone: Record<ConnectionQuality, string> = {
  good: "bg-positive",
  fair: "bg-warning",
  poor: "bg-danger",
};

function Tile({
  p,
  speaking,
  big = false,
  spotlighted = false,
}: {
  p: Participant;
  speaking: boolean;
  big?: boolean;
  spotlighted?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg bg-raised",
        speaking && "ring-2 ring-accent",
        spotlighted && "ring-2 ring-warning",
        big ? "h-full w-full" : "aspect-video",
      )}
    >
      {p.camOn ? (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-surface" aria-hidden />
      ) : null}
      <Avatar name={p.name} size={big ? 96 : 52} />

      {p.quality ? (
        <span
          className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-overlay px-1.5 py-0.5 text-base text-white"
          title={t(`meetings.quality.${p.quality}`)}
        >
          <span className={cn("inline-block h-2 w-2 rounded-full", qualityTone[p.quality])} aria-hidden />
        </span>
      ) : null}
      {spotlighted ? (
        <span className="absolute right-2 top-2 rounded-md bg-warning px-1.5 py-1 text-bg" title={t("meetings.spotlighted")}>
          <PushPin size={14} weight="fill" aria-hidden />
        </span>
      ) : null}

      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-overlay px-2 py-0.5 text-base text-white">
        {!p.micOn ? <MicrophoneSlash size={14} aria-label={t("meetings.muted")} /> : null}
        <span className="max-w-[12rem] truncate">{p.isSelf ? t("meetings.you") : p.name}</span>
      </div>
      {p.handRaised ? (
        <div className="absolute bottom-2 right-2 rounded-md bg-warning px-1.5 py-1 text-bg">
          <Hand size={16} weight="fill" aria-label={t("meetings.handRaised")} />
        </div>
      ) : null}
    </div>
  );
}

function Filmstrip({ items }: { items: Participant[] }) {
  const { activeSpeakerId } = useMeetingStore();
  return (
    <div className="flex gap-2 overflow-x-auto">
      {items.map((p) => (
        <div key={p.id} className="w-40 shrink-0">
          <Tile p={p} speaking={p.id === activeSpeakerId && p.micOn} />
        </div>
      ))}
    </div>
  );
}

function ScreenShareView({ presenter }: { presenter: Participant }) {
  const { t } = useTranslation();
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden rounded-lg border border-border bg-[#0f1320]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(127,178,255,0.18),transparent_60%)]" aria-hidden />
      <div className="flex items-center gap-2 rounded-md bg-overlay px-3 py-2 text-base text-white">
        <Monitor size={20} aria-hidden />
        {t("meetings.sharingScreen", { name: presenter.isSelf ? t("meetings.you") : presenter.name })}
      </div>
    </div>
  );
}

export function Stage() {
  const { participants, layout, activeSpeakerId, screenSharing, spotlightId } = useMeetingStore();
  if (participants.length === 0) return null;

  const spot = spotlightId ? participants.find((p) => p.id === spotlightId) : undefined;

  if (screenSharing) {
    const presenter = participants.find((p) => p.screenSharing) ?? participants[0];
    return (
      <div className="flex h-full flex-col gap-3 p-3">
        <div className="min-h-0 flex-1">
          <ScreenShareView presenter={presenter} />
        </div>
        <Filmstrip items={participants} />
      </div>
    );
  }

  // Spotlight or speaker layout → one big tile + filmstrip
  if (spot || layout === "speaker") {
    const main = spot ?? participants.find((p) => p.id === activeSpeakerId) ?? participants[0];
    const others = participants.filter((p) => p.id !== main.id);
    return (
      <div className="flex h-full flex-col gap-3 p-3">
        <div className="min-h-0 flex-1">
          <Tile p={main} speaking={main.micOn} big spotlighted={!!spot} />
        </div>
        <Filmstrip items={others} />
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-2 content-center gap-3 p-3 sm:grid-cols-3">
      {participants.map((p) => (
        <Tile key={p.id} p={p} speaking={p.id === activeSpeakerId && p.micOn} />
      ))}
    </div>
  );
}
