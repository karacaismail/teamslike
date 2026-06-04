import { useTranslation } from "react-i18next";
import { SignOut } from "@/lib/icons";
import { useEventStore } from "../eventStore";
import { Button } from "@/components/ui/primitives";
import { StageView } from "./StageView";
import { CaptionsLayer } from "./CaptionsLayer";
import { PollOverlay } from "./PollOverlay";
import { QnaBoard } from "./QnaBoard";
import { CtaBanner } from "./CtaBanner";

/** Attendee experience — high-contrast dark stage (AAA on dark). */
export function EventLive() {
  const { t } = useTranslation();
  const exitLive = useEventStore((s) => s.exitLive);
  const event = useEventStore((s) => s.events.find((e) => e.id === s.activeEventId)!);

  return (
    <div data-theme="dark" className="space-y-3 rounded-xl bg-bg p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-fg">{event.title}</span>
        <Button variant="secondary" className="ml-auto" onClick={exitLive}>
          <SignOut size={18} aria-hidden /> {t("webinar.exitLive")}
        </Button>
      </div>

      <CtaBanner />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="h-[58vh]">
            <StageView />
          </div>
          <CaptionsLayer />
        </div>
        <div className="space-y-3">
          <PollOverlay />
          <QnaBoard />
        </div>
      </div>
    </div>
  );
}
