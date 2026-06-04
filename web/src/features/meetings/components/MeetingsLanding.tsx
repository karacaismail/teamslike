import * as React from "react";
import { useTranslation } from "react-i18next";
import { VideoCamera, Plus, Users, Lock, LockOpen, Trash, LinkSimple, Copy } from "@/lib/icons";
import { useMeetingStore } from "../store";
import { MEETINGS } from "../data";
import { memberName } from "@/lib/identity";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, Button, Card, IconButton } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CreateRoomDialog } from "./CreateRoomDialog";

/** Persistent personal-room URL for the signed-in host (Webex Personal Room parity). */
const PERSONAL_ROOM_URL = "https://aura.dev/meet/ismail-k";

export function MeetingsLanding() {
  const { t } = useTranslation();
  const { startInstant, openPrejoin, rooms, joinRoom, deleteRoom } = useMeetingStore();
  const [roomDialog, setRoomDialog] = React.useState(false);
  const [confirmRoomId, setConfirmRoomId] = React.useState<string | null>(null);
  const confirmRoom = rooms.find((r) => r.id === confirmRoomId) ?? null;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-fg">{t("nav.meetings")}</h1>
          <p className="mt-1 text-base text-muted">{t("meetings.landingSubtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => openPrejoin("mtg_standup")}>
            <Users size={18} aria-hidden />
            {t("meetings.join")}
          </Button>
          <Button onClick={startInstant}>
            <Plus size={18} aria-hidden />
            {t("meetings.newMeeting")}
          </Button>
        </div>
      </div>

      {/* Personal room — persistent meeting URL per host (Webex parity) */}
      <Card className="mt-6 flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-surface text-accent">
          <LinkSimple size={22} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold text-fg">{t("meetings.personalRoom")}</div>
          <div className="truncate text-base text-muted">{PERSONAL_ROOM_URL}</div>
        </div>
        <IconButton label={t("meetings.copyLink")} onClick={() => void navigator.clipboard?.writeText(PERSONAL_ROOM_URL)}>
          <Copy size={18} aria-hidden />
        </IconButton>
        <Button onClick={startInstant}>{t("meetings.startRoom")}</Button>
      </Card>

      {/* Upcoming / live meetings */}
      <h2 className="mt-6 text-xl font-semibold text-fg">{t("meetings.upcoming")}</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MEETINGS.map((m) => (
          <Card key={m.id} className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-surface text-accent">
                <VideoCamera size={24} weight="fill" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-lg font-semibold text-fg">{m.title}</div>
                <div className="truncate text-base text-muted">{m.host}</div>
              </div>
              {m.live ? (
                <Badge tone="danger">{t("meetings.live")}</Badge>
              ) : (
                <Badge tone="neutral">{t("meetings.inMin", { n: m.startsInMin })}</Badge>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex -space-x-2" aria-label={t("meetings.participantCount", { n: m.participantIds.length })}>
                {m.participantIds.slice(0, 4).map((id) => (
                  <span key={id} className="rounded-full ring-2 ring-[var(--raised)]">
                    <Avatar name={memberName(id)} size={28} />
                  </span>
                ))}
                {m.participantIds.length > 4 ? (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface text-base text-muted ring-2 ring-[var(--raised)]">
                    +{m.participantIds.length - 4}
                  </span>
                ) : null}
              </div>
              <Button onClick={() => openPrejoin(m.id)}>{t("meetings.joinShort")}</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Persistent video rooms (moderator-created, Jitsi-style) */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-fg">{t("meetings.rooms")}</h2>
        <Button variant="secondary" onClick={() => setRoomDialog(true)}>
          <Plus size={18} aria-hidden />
          {t("meetings.createRoom")}
        </Button>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <Card key={r.id} className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-surface text-accent">
              {r.locked ? <Lock size={22} aria-hidden /> : <LockOpen size={22} aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-semibold text-fg">{r.name}</div>
              <div className="truncate text-base text-muted">
                {t("meetings.participantCount", { n: r.participants ?? 0 })}
                {r.waitingRoom ? ` · ${t("meetings.waitingRoom")}` : ""}
              </div>
            </div>
            <Button onClick={() => joinRoom(r.id)}>{t("meetings.joinShort")}</Button>
            <IconButton label={t("meetings.deleteRoom")} onClick={() => setConfirmRoomId(r.id)}>
              <Trash size={18} aria-hidden />
            </IconButton>
          </Card>
        ))}
      </div>

      <CreateRoomDialog open={roomDialog} onOpenChange={setRoomDialog} />
      <ConfirmDialog
        open={confirmRoom !== null}
        onOpenChange={(v) => { if (!v) setConfirmRoomId(null); }}
        title={t("meetings.deleteRoom")}
        body={confirmRoom ? t("meetings.deleteRoomConfirm", { name: confirmRoom.name }) : ""}
        confirmLabel={t("common.delete")}
        onConfirm={() => { if (confirmRoomId) deleteRoom(confirmRoomId); setConfirmRoomId(null); }}
      />
    </div>
  );
}
