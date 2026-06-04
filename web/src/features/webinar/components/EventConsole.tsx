import * as React from "react";
import { useTranslation } from "react-i18next";
import { Sliders, ClipboardText, FilmSlate, ChartBar, Ticket } from "@/lib/icons";
import { cn } from "@/lib/cn";
import { useTabKeys } from "@/lib/useTabKeys";
import type { IconType } from "@/types/domain";
import { EventBuilder } from "./EventBuilder";
import { RegistrationBuilder } from "./RegistrationBuilder";
import { Backstage } from "./Backstage";
import { AnalyticsTab } from "./AnalyticsTab";
import { EventManager } from "./EventManager";

type Tab = "builder" | "registration" | "events" | "backstage" | "analytics";
const TABS: { id: Tab; Icon: IconType }[] = [
  { id: "builder", Icon: Sliders },
  { id: "registration", Icon: ClipboardText },
  { id: "events", Icon: Ticket },
  { id: "backstage", Icon: FilmSlate },
  { id: "analytics", Icon: ChartBar },
];

export function EventConsole() {
  const { t } = useTranslation();
  const [tab, setTab] = React.useState<Tab>("builder");
  const onTabKey = useTabKeys(TABS.map((x) => x.id), tab, setTab);

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label={t("webinar.console")} className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map(({ id, Icon }) => (
          <button
            key={id}
            role="tab"
            data-tab={id}
            aria-selected={tab === id}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={onTabKey}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-t-md border-b-2 px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              tab === id ? "border-accent text-accent" : "border-transparent text-muted hover:text-fg",
            )}
          >
            <Icon size={18} aria-hidden /> {t(`webinar.tabs.${id}`)}
          </button>
        ))}
      </div>

      {tab === "builder" ? <EventBuilder /> : null}
      {tab === "registration" ? <RegistrationBuilder /> : null}
      {tab === "events" ? <EventManager /> : null}
      {tab === "backstage" ? <Backstage /> : null}
      {tab === "analytics" ? <AnalyticsTab /> : null}
    </div>
  );
}
