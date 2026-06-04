import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Microphone,
  MicrophoneSlash,
  Pause,
  Play,
  ArrowsLeftRight,
  PhoneX,
  PhoneCall,
  Sparkle,
  Record,
  BookmarkSimple,
  SquaresFour,
  UserPlus,
  Check,
  Headset,
  ShieldWarning,
  MusicNotes,
} from "@/lib/icons";
import { useCallStore } from "../callStore";
import { CONTACTS } from "../data";
import { callerName, formatNumber, classifyCaller } from "../routing";
import { monitorAudio } from "../pbx";
import { useOpenIntelligence } from "@/features/integration";
import { useAuthStore } from "@/store/authStore";
import { IconButton, Button, Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { CallStateChip, fmtDuration } from "./CallStateChip";
import { WrapUpCard } from "./WrapUpCard";
import type { MonitorMode } from "../types";

const DTMF_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
const MONITOR_MODES: MonitorMode[] = ["listen", "whisper", "barge", "takeover"];

export function ActiveCallBar() {
  const { t } = useTranslation();
  const call = useCallStore((s) => s.activeCall);
  const muted = useCallStore((s) => s.muted);
  const parked = useCallStore((s) => s.parkedCalls);
  const consult = useCallStore((s) => s.consult);
  const monitor = useCallStore((s) => s.monitor);
  const holdMusic = useCallStore((s) => s.holdMusic);
  const blocklist = useCallStore((s) => s.blocklist);
  const pendingWrapUp = useCallStore((s) => s.pendingWrapUp);
  const can = useAuthStore((s) => s.can);
  const openIntel = useOpenIntelligence();

  const [showDtmf, setShowDtmf] = React.useState(false);
  const [showXfer, setShowXfer] = React.useState(false);
  const [xferTo, setXferTo] = React.useState("");

  React.useEffect(() => {
    if (call?.state !== "active") return;
    const id = setInterval(() => useCallStore.getState().tick(), 1000);
    return () => clearInterval(id);
  }, [call?.state]);

  React.useEffect(() => {
    if (call?.state === "ringing" && call.direction === "outbound") {
      const id = setTimeout(() => useCallStore.getState().answer(), 900);
      return () => clearTimeout(id);
    }
  }, [call?.state, call?.direction]);

  if (!call && parked.length === 0 && !pendingWrapUp) return null;

  const cs = useCallStore.getState();
  const remote = call ? (call.direction === "outbound" ? call.to : call.from) : "";
  const name = call ? callerName(remote, CONTACTS) : "";
  const numberStr = call ? formatNumber(remote) : "";
  const inboundRinging = call?.state === "ringing" && call.direction === "inbound";
  const callerClass = call ? classifyCaller(remote, { contacts: CONTACTS, blocklist }) : "unknown";
  const isSupervisor = can("admin.access");

  return (
    <div className="fixed bottom-20 left-1/2 z-50 w-[min(46rem,94vw)] -translate-x-1/2 space-y-2 md:bottom-4">
      {/* Parked calls */}
      {parked.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-raised px-3 py-2 shadow-lg">
          <span className="text-base font-medium text-muted">{t("phone.parkedCalls")}</span>
          {parked.map((p) => (
            <Button key={p.id} variant="secondary" onClick={() => cs.pickup(p.id)}>
              <PhoneCall size={16} aria-hidden /> {callerName(p.direction === "outbound" ? p.to : p.from, CONTACTS)}
            </Button>
          ))}
        </div>
      ) : null}

      {call ? (
        <div
          role="region"
          aria-label={t("phone.activeCall")}
          className="rounded-xl border border-border bg-raised px-4 py-3 shadow-xl"
        >
          {/* DTMF keypad */}
          {showDtmf ? (
            <div className="mb-2 grid grid-cols-6 gap-1">
              {DTMF_KEYS.map((d) => (
                <button
                  key={d}
                  aria-label={t("phone.dtmfKey", { d })}
                  onClick={() => cs.sendDtmf(d)}
                  className="h-10 rounded-md border border-border bg-surface text-base text-fg hover:bg-bg"
                >
                  {d}
                </button>
              ))}
              {call.dtmf ? (
                <span className="col-span-6 text-base text-muted">{t("phone.sent")}: {call.dtmf}</span>
              ) : null}
            </div>
          ) : null}

          {/* Warm transfer / conference */}
          {showXfer && !consult ? (
            <div className="mb-2 flex items-end gap-2">
              <input
                value={xferTo}
                onChange={(e) => setXferTo(e.target.value)}
                placeholder={t("phone.numberPlaceholder")}
                aria-label={t("phone.transferTo")}
                className="h-10 flex-1 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none"
              />
              <Button variant="secondary" disabled={!xferTo.trim()} onClick={() => { cs.startConsult(xferTo); setXferTo(""); }}>
                <ArrowsLeftRight size={16} aria-hidden /> {t("phone.warmTransfer")}
              </Button>
              <Button variant="secondary" disabled={!xferTo.trim()} onClick={() => { cs.addToCall(xferTo); setXferTo(""); setShowXfer(false); }}>
                <UserPlus size={16} aria-hidden /> {t("phone.addToCall")}
              </Button>
            </div>
          ) : null}

          {/* Consult-in-progress controls */}
          {consult ? (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="flex-1 text-base text-fg">
                {t("phone.consulting", { who: callerName(consult.to, CONTACTS) })}
              </span>
              <Button onClick={cs.completeTransfer}>
                <Check size={16} aria-hidden /> {t("phone.completeTransfer")}
              </Button>
              <Button variant="secondary" onClick={cs.mergeConsult}>
                <UserPlus size={16} aria-hidden /> {t("phone.merge")}
              </Button>
              <Button variant="ghost" onClick={cs.cancelConsult}>{t("phone.cancelConsult")}</Button>
            </div>
          ) : null}

          {isSupervisor && !inboundRinging ? (
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-base text-muted">
                <Headset size={16} aria-hidden /> {t("phone.monitor.label")}
              </span>
              {MONITOR_MODES.map((m) => (
                <button
                  key={m}
                  aria-pressed={monitor === m}
                  onClick={() => cs.setMonitor(m)}
                  className={cn(
                    "rounded-md border px-2 py-1 text-base",
                    monitor === m ? "border-accent text-accent" : "border-border text-muted hover:bg-surface",
                  )}
                >
                  {t(`phone.monitor.${m}`)}
                </button>
              ))}
              {monitor ? (
                <button onClick={cs.stopMonitor} className="rounded-md border border-border px-2 py-1 text-base text-muted hover:bg-surface">
                  {t("phone.monitor.stop")}
                </button>
              ) : null}
              {monitor ? (
                <span className="text-base text-muted" aria-live="polite">
                  · {monitorAudio(monitor).agentHearsSupervisor ? t("phone.monitor.agentHears") : t("phone.monitor.agentSilent")}
                  {monitorAudio(monitor).customerHearsSupervisor ? ` · ${t("phone.monitor.customerHears")}` : ""}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1" aria-live="polite">
              <div className="flex items-center gap-2">
                <CallStateChip state={call.state} />
                {call.state === "active" ? (
                  <span className="text-base tabular-nums text-muted">{fmtDuration(call.durationSec)}</span>
                ) : null}
                {call.recording ? (
                  <span className="inline-flex items-center gap-1 text-base text-danger">
                    <Record size={14} weight="fill" aria-hidden /> {t("phone.rec")}
                  </span>
                ) : null}
                {callerClass === "spam" || callerClass === "blocked" ? (
                  <Badge tone="danger">
                    <ShieldWarning size={14} aria-hidden /> {t(`phone.caller.${callerClass}`)}
                  </Badge>
                ) : null}
                {call.state === "hold" ? (
                  <button
                    onClick={cs.toggleHoldMusic}
                    aria-pressed={holdMusic}
                    className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-base", holdMusic ? "border-accent text-accent" : "border-border text-muted hover:bg-surface")}
                  >
                    <MusicNotes size={14} aria-hidden /> {holdMusic ? t("phone.holdMusicOn") : t("phone.holdMusicOff")}
                  </button>
                ) : null}
              </div>
              <div className="truncate text-base font-semibold text-fg">{name}</div>
              {name !== numberStr ? <div className="truncate text-base text-muted">{numberStr}</div> : null}
              {call.participants?.length ? (
                <div className="truncate text-base text-muted">+ {call.participants.length} {t("phone.onConference")}</div>
              ) : null}
            </div>

            {inboundRinging ? (
              <div className="flex items-center gap-2">
                <Button onClick={cs.answer} className="bg-positive text-white">
                  <PhoneCall size={18} weight="fill" aria-hidden /> {t("phone.answer")}
                </Button>
                <Button variant="danger" onClick={() => cs.hangup("declined")}>
                  <PhoneX size={18} aria-hidden /> {t("phone.decline")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                <IconButton label={muted ? t("phone.unmute") : t("phone.mute")} variant={muted ? "primary" : "ghost"} onClick={cs.toggleMute}>
                  {muted ? <MicrophoneSlash size={20} aria-hidden /> : <Microphone size={20} aria-hidden />}
                </IconButton>
                {call.state === "hold" && !consult ? (
                  <IconButton label={t("phone.resume")} variant="primary" onClick={cs.resume}>
                    <Play size={20} aria-hidden />
                  </IconButton>
                ) : (
                  <IconButton label={t("phone.hold")} onClick={cs.hold}>
                    <Pause size={20} aria-hidden />
                  </IconButton>
                )}
                <IconButton label={t("phone.record")} variant={call.recording ? "danger" : "ghost"} onClick={cs.toggleRecording}>
                  <Record size={20} aria-hidden />
                </IconButton>
                <IconButton label={t("phone.dtmf")} variant={showDtmf ? "primary" : "ghost"} onClick={() => setShowDtmf((v) => !v)}>
                  <SquaresFour size={20} aria-hidden />
                </IconButton>
                <IconButton label={t("phone.park")} onClick={cs.park}>
                  <BookmarkSimple size={20} aria-hidden />
                </IconButton>
                <IconButton label={t("phone.transfer")} variant={showXfer ? "primary" : "ghost"} onClick={() => setShowXfer((v) => !v)}>
                  <ArrowsLeftRight size={20} aria-hidden />
                </IconButton>
                <Button variant="ghost" onClick={() => openIntel("src_sales")} className="hidden sm:inline-flex">
                  <Sparkle size={18} aria-hidden /> {t("phone.aiCoach")}
                </Button>
                <Button variant="danger" onClick={() => cs.hangup()}>
                  <PhoneX size={18} aria-hidden /> {t("phone.hangup")}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {pendingWrapUp ? <WrapUpCard /> : null}
    </div>
  );
}
