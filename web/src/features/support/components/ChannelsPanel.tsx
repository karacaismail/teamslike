import { useTranslation } from "react-i18next";
import { Plugs } from "@/lib/icons";
import { useInboxStore } from "../inboxStore";
import { channelOnboardingState, canEnableCoexistence, connectedCount } from "../channels";
import { CHANNEL_ICON } from "./shared";
import { Badge, Card } from "@/components/ui/primitives";
import type { ChannelConnection } from "../types";

const TONE: Record<ChannelConnection, "positive" | "accent" | "warning" | "neutral"> = {
  connected: "positive",
  coexistence: "accent",
  pending: "warning",
  disconnected: "neutral",
};

/** Channel connection / Coexistence onboarding (Embedded Signup parity). */
export function ChannelsPanel() {
  const { t } = useTranslation();
  const inboxes = useInboxStore((s) => s.inboxes);

  return (
    <Card>
      <div className="mb-2 flex items-center gap-2">
        <h3 className="flex items-center gap-1 text-base font-semibold text-fg">
          <Plugs size={18} aria-hidden /> {t("support.channels.title")}
        </h3>
        <Badge tone="positive">{t("support.channels.connected", { n: connectedCount(inboxes) })}</Badge>
      </div>

      <ul className="space-y-1">
        {inboxes.map((ib) => {
          const Icon = CHANNEL_ICON[ib.channelType];
          const conn = ib.connection ?? "disconnected";
          const step = channelOnboardingState(conn);
          return (
            <li key={ib.id} className="rounded-md border border-border px-3 py-1.5">
              <div className="flex items-center gap-2 text-base">
                <Icon size={16} className="text-muted" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-fg">{ib.name}</span>
                {canEnableCoexistence(ib) ? <Badge tone="accent">{t("support.channels.coexistence")}</Badge> : null}
                <Badge tone={TONE[conn]}>{t(`support.channels.step.${step.step}`)}</Badge>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-border" aria-hidden>
                <div className="h-1.5 rounded-full bg-accent" style={{ width: `${Math.round(step.progress * 100)}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
