import { useTranslation } from "react-i18next";
import { Translate, LockKey, Waveform } from "@/lib/icons";
import { useCaptionsStore } from "../captionsStore";
import { useIntelStore } from "../store";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

const LANGS = ["tr", "en", "es", "de", "fr", "ar"];

/** Canonical live-translation session controls (TranslationSession aggregate). */
export function TranslationSessionPanel() {
  const { t } = useTranslation();
  const activeSourceId = useIntelStore((s) => s.activeSourceId);
  const session = useCaptionsStore((s) => s.session);
  const startSession = useCaptionsStore((s) => s.startSession);
  const endSession = useCaptionsStore((s) => s.endSession);
  const setTargetLangs = useCaptionsStore((s) => s.setTargetLangs);
  const setVoicePreserving = useCaptionsStore((s) => s.setVoicePreserving);

  const toggleLang = (code: string) => {
    if (!session) return;
    const has = session.targetLangs.includes(code);
    const next = has ? session.targetLangs.filter((l) => l !== code) : [...session.targetLangs, code];
    setTargetLangs(next.length ? next : [code]);
  };

  return (
    <Card>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-1 text-base font-semibold text-fg">
          <Translate size={18} aria-hidden /> {t("intel.session.title")}
        </h3>
        {session ? (
          <>
            <Badge tone="neutral">{session.sourceLang}</Badge>
            <Badge tone={session.voicePreserving ? "positive" : "neutral"}>
              <LockKey size={13} aria-hidden /> {session.voicePreserving ? t("intel.session.voiceOn") : t("intel.session.voiceOff")}
            </Badge>
            <span className="text-base text-muted">{t("intel.session.buffered", { n: session.segments.length })}</span>
            <Button variant="ghost" className="ml-auto" onClick={endSession}>{t("intel.session.end")}</Button>
          </>
        ) : (
          <Button variant="secondary" className="ml-auto" onClick={() => startSession(activeSourceId, ["tr"])}>
            {t("intel.session.start")}
          </Button>
        )}
      </div>

      {session ? (
        <>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {LANGS.map((code) => {
              const on = session.targetLangs.includes(code);
              return (
                <button
                  key={code}
                  aria-pressed={on}
                  onClick={() => toggleLang(code)}
                  className={cn("rounded-md border px-2 py-1 text-base uppercase", on ? "border-accent text-accent" : "border-border text-muted hover:bg-surface")}
                >
                  {code}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setVoicePreserving(!session.voicePreserving)}
            aria-pressed={session.voicePreserving}
            className={cn("inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-base", session.voicePreserving ? "border-accent text-accent" : "border-border text-muted hover:bg-surface")}
          >
            <Waveform size={16} aria-hidden /> {t("intel.session.voicePreserve")}
          </button>
        </>
      ) : null}
    </Card>
  );
}
