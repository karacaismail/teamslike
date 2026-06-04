import { useTranslation } from "react-i18next";
import { SealCheck, ListChecks, ArrowRight, PaperPlaneTilt } from "@/lib/icons";
import { useIntelStore } from "../store";
import { RECAPS } from "../data";
import { memberName } from "@/lib/identity";
import { useSendActionToChat } from "@/features/integration";
import { useToastStore } from "@/store/toastStore";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/primitives";

/** Structured AI recap (Zoom/Teams Intelligent Recap) — action items can be
 * pushed into Messaging (Faz 2 cross-cut). */
export function RecapPanel() {
  const { t } = useTranslation();
  const id = useIntelStore((s) => s.activeSourceId);
  const recap = RECAPS[id];
  const push = useToastStore((s) => s.push);
  const sendActionToChat = useSendActionToChat();
  if (!recap) return null;

  const sendToChat = (text: string) => {
    sendActionToChat(text);
    push({ title: t("intel.sentToChat"), tone: "positive" });
  };

  return (
    <Card>
      <h3 className="mb-1 flex items-center gap-1 text-base font-semibold text-accent">
        <SealCheck size={16} weight="fill" aria-hidden /> {t("intel.recap")}
      </h3>
      <p className="text-base text-fg">{recap.tldr}</p>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {recap.decisions.length > 0 ? (
          <section>
            <h4 className="mb-1 text-base font-semibold text-muted">{t("intel.decisions")}</h4>
            <ul className="ml-5 list-disc text-base text-fg">
              {recap.decisions.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {recap.nextSteps.length > 0 ? (
          <section>
            <h4 className="mb-1 text-base font-semibold text-muted">{t("intel.nextSteps")}</h4>
            <ul className="ml-5 list-disc text-base text-fg">
              {recap.nextSteps.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {recap.actions.length > 0 ? (
        <section className="mt-3">
          <h4 className="mb-1 flex items-center gap-1 text-base font-semibold text-muted">
            <ListChecks size={16} aria-hidden /> {t("intel.actionItems")}
          </h4>
          <ul className="space-y-1.5">
            {recap.actions.map((a) => (
              <li key={a.id} className="flex items-center gap-2 rounded-md border border-border p-2">
                <ArrowRight size={14} className="text-accent" aria-hidden />
                <span className="flex-1 text-base text-fg">{a.text}</span>
                <span className="inline-flex items-center gap-1 text-base text-muted">
                  <Avatar name={memberName(a.ownerId)} size={22} />
                  <span className="hidden sm:inline">{memberName(a.ownerId)}</span>
                </span>
                <button
                  onClick={() => sendToChat(a.text)}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-base text-accent hover:bg-surface"
                >
                  <PaperPlaneTilt size={14} aria-hidden /> {t("intel.sendToChat")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Card>
  );
}
