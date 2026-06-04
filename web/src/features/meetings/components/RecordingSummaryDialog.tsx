import { useTranslation } from "react-i18next";
import { DownloadSimple, Sparkle } from "@/lib/icons";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/primitives";
import { useToastStore } from "@/store/toastStore";
import { downloadText } from "@/lib/download";
import { CAPTION_SCRIPT } from "../data";
import { memberName } from "@/lib/identity";

/** Post-recording artifact: transcript + AI summary + action items (Teams/Zoom/Meet). */
export function RecordingSummaryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const push = useToastStore((s) => s.push);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("meetings.recapTitle")}>
      <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
        <section>
          <h3 className="mb-1 flex items-center gap-1 text-base font-semibold text-accent">
            <Sparkle size={16} weight="fill" aria-hidden /> {t("meetings.aiSummary")}
          </h3>
          <p className="text-base text-fg">{t("meetings.recapSummary")}</p>
          <ul className="mt-2 ml-5 list-disc text-base text-fg">
            <li>{t("meetings.recapAction1")}</li>
            <li>{t("meetings.recapAction2")}</li>
            <li>{t("meetings.recapAction3")}</li>
          </ul>
        </section>

        <section>
          <h3 className="mb-1 text-base font-semibold text-muted">{t("meetings.transcript")}</h3>
          <div className="space-y-1 rounded-md border border-border bg-surface p-3">
            {CAPTION_SCRIPT.map((line, i) => (
              <div key={i} className="text-base">
                <span className="font-semibold text-accent">{memberName(line.speakerId)}: </span>
                <span className="text-fg">{line.en}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <Button
            onClick={() => {
              const text = CAPTION_SCRIPT.map((l) => `${memberName(l.speakerId)}: ${l.en}`).join("\n");
              downloadText("meeting-recap.txt", text, "text/plain");
              push({ title: t("meetings.recapDownloaded"), tone: "positive" });
            }}
          >
            <DownloadSimple size={18} aria-hidden />
            {t("meetings.downloadRecap")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
