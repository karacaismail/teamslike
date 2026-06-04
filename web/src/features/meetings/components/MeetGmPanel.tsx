import { useTranslation } from "react-i18next";
import {
  MicrophoneSlash,
  VideoCameraSlash,
  ShieldCheck,
  PushPin,
  Eye,
  UserMinus,
  PencilSimple,
  CursorClick,
  Sparkle,
  Translate,
  GearSix,
} from "@/lib/icons";
import { useMeetingStore } from "../store";
import { Badge, Button } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { AccessTier, BandwidthPolicy, NotesRecipients, ResolutionLevel } from "../types";

const TIERS: AccessTier[] = ["open", "trusted", "restricted"];
const RES: ResolutionLevel[] = ["auto", "fhd", "hd", "sd", "audio"];
const BW: BandwidthPolicy[] = ["auto", "limited", "audio"];
const RECIPIENTS: NotesRecipients[] = ["all", "inorg", "hosts"];
const LANGS = ["en", "tr", "es", "fr", "de", "pt", "it"];

function Toggle({ label, on, onToggle, icon }: { label: string; on: boolean; onToggle: () => void; icon: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      className="flex h-11 w-full items-center gap-2 rounded-md border border-border px-3 text-base text-fg hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className={cn("text-base", on ? "text-accent" : "text-muted")}>{on ? t("meetings.on") : t("meetings.off")}</span>
    </button>
  );
}

export function MeetGmPanel() {
  const { t } = useTranslation();
  const s = useMeetingStore();
  const self = s.participants.find((p) => p.isSelf);
  const others = s.participants.filter((p) => !p.isSelf);

  return (
    <div className="space-y-4">
      {/* Granular moderation */}
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-muted">{t("meetings.gm.title")}</h3>
        <Toggle label={t("meetings.gm.audioLock")} on={s.audioLock} onToggle={s.toggleAudioLock} icon={<MicrophoneSlash size={18} aria-hidden />} />
        <Toggle label={t("meetings.gm.videoLock")} on={s.videoLock} onToggle={s.toggleVideoLock} icon={<VideoCameraSlash size={18} aria-hidden />} />
        <Toggle label={t("meetings.gm.requireConsent")} on={s.requireConsent} onToggle={s.toggleRequireConsent} icon={<ShieldCheck size={18} aria-hidden />} />
        <label className="flex items-center gap-2 text-base text-fg">
          <span className="flex-1">{t("meetings.gm.accessTier")}</span>
          <select
            value={s.accessTier}
            onChange={(e) => s.setAccessTier(e.target.value as AccessTier)}
            className="h-9 rounded-md border border-border bg-surface px-2 text-base text-fg"
          >
            {TIERS.map((tier) => (
              <option key={tier} value={tier}>{t(`meetings.gm.tier.${tier}`)}</option>
            ))}
          </select>
        </label>
      </section>

      {/* Per-participant: pin / viewer / eject */}
      {others.length > 0 ? (
        <section className="space-y-1">
          <h3 className="text-base font-semibold text-muted">{t("meetings.gm.participants")}</h3>
          {others.map((p) => {
            const pinned = s.pinnedIds.includes(p.id);
            return (
              <div key={p.id} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-base">
                <span className="min-w-0 flex-1 truncate text-fg">{p.name}</span>
                {p.role === "viewer" ? <Badge tone="neutral">{t("meetings.gm.viewer")}</Badge> : null}
                <button onClick={() => s.togglePin(p.id)} aria-pressed={pinned} aria-label={t("meetings.gm.pin")} className={cn("rounded-md p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent", pinned ? "text-accent" : "text-muted hover:bg-raised")}>
                  <PushPin size={18} aria-hidden weight={pinned ? "fill" : "regular"} />
                </button>
                <button onClick={() => s.makeViewer(p.id)} aria-label={t("meetings.gm.makeViewer")} className="rounded-md p-1.5 text-muted hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  <Eye size={18} aria-hidden />
                </button>
                <button onClick={() => s.sendToWaitingRoom(p.id)} aria-label={t("meetings.gm.toWaiting")} className="rounded-md p-1.5 text-muted hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  <UserMinus size={18} aria-hidden />
                </button>
              </div>
            );
          })}
          <p className="text-base text-muted">{t("meetings.gm.pinned", { n: s.pinnedIds.length })}</p>
        </section>
      ) : null}

      {/* Annotation + remote control (the two gaps Google leaves open) */}
      <section className="space-y-2">
        <Toggle label={t("meetings.gm.annotate")} on={s.annotateOn} onToggle={s.toggleAnnotate} icon={<PencilSimple size={18} aria-hidden />} />
        <div className="rounded-md border border-border p-2">
          <div className="mb-1 flex items-center gap-2 text-base text-fg">
            <CursorClick size={18} aria-hidden /> <span className="flex-1">{t("meetings.gm.remoteControl")}</span>
            {s.remoteControl?.controllerId ? <Badge tone="positive">{t("meetings.gm.controlActive")}</Badge> : null}
          </div>
          {!s.remoteControl ? (
            <Button variant="secondary" className="w-full" onClick={() => s.requestRemoteControl(self?.id ?? "self")}>
              {t("meetings.gm.requestControl")}
            </Button>
          ) : s.remoteControl.controllerId ? (
            <Button variant="ghost" className="w-full" onClick={s.stopRemoteControl}>
              {t("meetings.gm.stopControl")}
            </Button>
          ) : (
            <Button className="w-full" onClick={() => s.grantRemoteControl(others[0]?.id ?? "self")}>
              {t("meetings.gm.grantControl")}
            </Button>
          )}
        </div>
      </section>

      {/* Take Notes for Me */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkle size={18} className="text-accent" aria-hidden />
          <h3 className="flex-1 text-base font-semibold text-fg">{t("meetings.gm.notes")}</h3>
          <Button variant="secondary" onClick={s.generateNotes}>{t("meetings.gm.generate")}</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["summary", "decisions", "nextSteps"] as const).map((k) => (
            <label key={k} className="inline-flex items-center gap-1 text-base text-fg">
              <input type="checkbox" checked={s.noteSections[k]} onChange={() => s.toggleNoteSection(k)} className="h-4 w-4 accent-accent" />
              {t(`meetings.gm.section.${k}`)}
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-base text-fg">
          <span className="flex-1">{t("meetings.gm.recipients")}</span>
          <select value={s.notesRecipients} onChange={(e) => s.setNotesRecipients(e.target.value as NotesRecipients)} className="h-9 rounded-md border border-border bg-surface px-2 text-base text-fg">
            {RECIPIENTS.map((r) => (
              <option key={r} value={r}>{t(`meetings.gm.recipient.${r}`)}</option>
            ))}
          </select>
        </label>
        {s.meetingNotes ? (
          <div className="rounded-md border border-border p-2 text-base">
            {s.noteSections.summary && s.meetingNotes.summary ? (
              <p className="text-fg"><span className="font-medium">{t("meetings.gm.section.summary")}: </span>{s.meetingNotes.summary}</p>
            ) : null}
            {s.noteSections.decisions && s.meetingNotes.decisions.length > 0 ? (
              <p className="mt-1 text-fg"><span className="font-medium">{t("meetings.gm.section.decisions")}: </span>{s.meetingNotes.decisions.join("; ")}</p>
            ) : null}
            {s.noteSections.nextSteps && s.meetingNotes.nextSteps.length > 0 ? (
              <p className="mt-1 text-fg"><span className="font-medium">{t("meetings.gm.section.nextSteps")}: </span>{s.meetingNotes.nextSteps.join("; ")}</p>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Speech translation (voice dubbing) */}
      <section className="space-y-2">
        <Toggle label={t("meetings.gm.speech")} on={s.speechTranslation} onToggle={s.toggleSpeechTranslation} icon={<Translate size={18} aria-hidden />} />
        {s.speechTranslation ? (
          <div className="flex items-center gap-2 text-base text-fg">
            <select value={s.speechFrom} onChange={(e) => s.setSpeechPair(e.target.value, s.speechTo)} aria-label={t("meetings.gm.speechFrom")} className="h-9 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg">
              {LANGS.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
            <span aria-hidden>→</span>
            <select value={s.speechTo} onChange={(e) => s.setSpeechPair(s.speechFrom, e.target.value)} aria-label={t("meetings.gm.speechTo")} className="h-9 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg">
              {LANGS.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
          </div>
        ) : null}
      </section>

      {/* Quality / bandwidth */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <GearSix size={18} className="text-muted" aria-hidden />
          <h3 className="text-base font-semibold text-muted">{t("meetings.gm.quality")}</h3>
        </div>
        <label className="flex items-center gap-2 text-base text-fg">
          <span className="flex-1">{t("meetings.gm.sendRes")}</span>
          <select value={s.sendResolution} onChange={(e) => s.setSendResolution(e.target.value as ResolutionLevel)} className="h-9 rounded-md border border-border bg-surface px-2 text-base text-fg">
            {RES.map((r) => <option key={r} value={r}>{t(`meetings.gm.res.${r}`)}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-base text-fg">
          <span className="flex-1">{t("meetings.gm.recvRes")}</span>
          <select value={s.receiveResolution} onChange={(e) => s.setReceiveResolution(e.target.value as ResolutionLevel)} className="h-9 rounded-md border border-border bg-surface px-2 text-base text-fg">
            {RES.map((r) => <option key={r} value={r}>{t(`meetings.gm.res.${r}`)}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-base text-fg">
          <span className="flex-1">{t("meetings.gm.bandwidth")}</span>
          <select value={s.bandwidthPolicy} onChange={(e) => s.setBandwidthPolicy(e.target.value as BandwidthPolicy)} className="h-9 rounded-md border border-border bg-surface px-2 text-base text-fg">
            {BW.map((b) => <option key={b} value={b}>{t(`meetings.gm.bw.${b}`)}</option>)}
          </select>
        </label>
        <Toggle label={t("meetings.gm.dataSaver")} on={s.dataSaver} onToggle={s.toggleDataSaver} icon={<GearSix size={18} aria-hidden />} />
      </section>
    </div>
  );
}
