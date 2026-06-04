import * as React from "react";
import { useTranslation } from "react-i18next";
import { Play, Voicemail as VoicemailIcon, Check, EnvelopeSimple } from "@/lib/icons";
import { VOICEMAILS, CONTACTS, GREETINGS } from "../data";
import { callerName } from "../routing";
import { fmtDuration } from "./CallStateChip";
import { useToastStore } from "@/store/toastStore";
import { Badge, Button, Card, EmptyState, IconButton } from "@/components/ui/primitives";
import type { Voicemail } from "../types";

export function VoicemailInbox() {
  const { t } = useTranslation();
  const push = useToastStore((s) => s.push);
  const [items, setItems] = React.useState<Voicemail[]>(() => VOICEMAILS.map((v) => ({ ...v })));
  const [greeting, setGreeting] = React.useState(GREETINGS[0].id);

  const play = (vm: Voicemail) => {
    push({ title: t("phone.vmPlaying"), tone: "positive" });
    setItems((xs) => xs.map((x) => (x.id === vm.id ? { ...x, heard: true } : x)));
  };
  const markHeard = (id: string) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, heard: true } : x)));

  return (
    <Card>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-2 text-base font-semibold text-fg">
          <VoicemailIcon size={18} aria-hidden /> {t("phone.voicemail.title")}
        </h3>
        <label className="ml-auto flex items-center gap-2 text-base text-muted">
          {t("phone.voicemail.greeting")}
          <select
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className="h-10 rounded-md border border-border bg-bg px-2 text-base text-fg"
          >
            {GREETINGS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </label>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={<VoicemailIcon size={28} aria-hidden />} title={t("phone.voicemail.empty")} />
      ) : (
        <ul className="space-y-2">
          {items.map((vm) => (
            <li key={vm.id} className="rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="flex-1 truncate text-base font-medium text-fg">
                  {callerName(vm.from, CONTACTS)}
                </span>
                {!vm.heard ? <Badge tone="accent">{t("phone.voicemail.new")}</Badge> : null}
                <span className="text-base text-muted">{fmtDuration(vm.durationSec)}</span>
              </div>
              {vm.transcript ? (
                <p className="mt-1 text-base text-muted">
                  <span className="font-medium text-fg">{t("phone.voicemail.transcript")}: </span>
                  {vm.transcript}
                </p>
              ) : null}
              <div className="mt-2 flex items-center gap-2">
                <Button variant="secondary" onClick={() => play(vm)}>
                  <Play size={16} aria-hidden /> {t("phone.voicemail.play")}
                </Button>
                <IconButton
                  label={t("phone.voicemail.forwardEmail")}
                  onClick={() => push({ title: t("phone.voicemail.forwarded"), tone: "positive" })}
                >
                  <EnvelopeSimple size={18} aria-hidden />
                </IconButton>
                {!vm.heard ? (
                  <IconButton label={t("phone.voicemail.markHeard")} onClick={() => markHeard(vm.id)}>
                    <Check size={18} aria-hidden />
                  </IconButton>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
