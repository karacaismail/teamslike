import * as React from "react";
import { Forbidden } from "@/components/ui/Forbidden";
import { useTranslation } from "react-i18next";
import {
  Prohibit,
  SquaresFour,
  Voicemail as VoicemailIcon,
  ChatCircle,
  GitBranch,
  UsersThree,
  TreeStructure,
  ChartBar,
  AddressBook,
  Headset,
  Robot,
} from "@/lib/icons";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { useTabKeys } from "@/lib/useTabKeys";
import { useUrlSelection } from "@/lib/useUrlSelection";
import type { IconType } from "@/types/domain";
import { Dialer } from "./components/Dialer";
import { CallHistory } from "./components/CallHistory";
import { VoicemailInbox } from "./components/VoicemailInbox";
import { MessagesPane } from "./components/MessagesPane";
import { RoutingRuleBuilder } from "./components/RoutingRuleBuilder";
import { CallQueuePanel } from "./components/CallQueuePanel";
import { IVRBuilder } from "./components/IVRBuilder";
import { CallAnalytics } from "./components/CallAnalytics";
import { Directory } from "./components/Directory";
import { AttendantConsole } from "./components/AttendantConsole";
import { ReceptionistBuilder } from "./components/ReceptionistBuilder";

type Tab = "keypad" | "directory" | "voicemail" | "messages" | "routing" | "queues" | "reception" | "attendant" | "ivr" | "analytics";
const TABS: { id: Tab; Icon: IconType }[] = [
  { id: "keypad", Icon: SquaresFour },
  { id: "directory", Icon: AddressBook },
  { id: "voicemail", Icon: VoicemailIcon },
  { id: "messages", Icon: ChatCircle },
  { id: "reception", Icon: Robot },
  { id: "queues", Icon: UsersThree },
  { id: "attendant", Icon: Headset },
  { id: "ivr", Icon: TreeStructure },
  { id: "routing", Icon: GitBranch },
  { id: "analytics", Icon: ChartBar },
];

export function PhoneLayout() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.can);
  const [tab, setTab] = React.useState<Tab>("keypad");
  const onTabKey = useTabKeys(TABS.map((x) => x.id), tab, setTab);
  // Deep-link the active phone tab (?tab=) — shareable + reload-safe (J2).
  useUrlSelection("tab", tab, (v) => setTab(v as Tab), (v) => TABS.some((x) => x.id === v));

  if (!can("telephony.view")) {
    return <Forbidden />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div>
        <h1 className="text-3xl font-bold text-fg">{t("nav.telephony")}</h1>
        <p className="mt-1 text-base text-muted">{t("phone.subtitle")}</p>
      </div>

      <div role="tablist" aria-label={t("nav.telephony")} className="flex flex-wrap gap-1 border-b border-border">
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
            <Icon size={18} aria-hidden /> {t(`phone.tabs.${id}`)}
          </button>
        ))}
      </div>

      {tab === "keypad" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="flex items-center justify-center">
            <Dialer />
          </Card>
          <CallHistory />
        </div>
      ) : null}
      {tab === "directory" ? <Directory /> : null}
      {tab === "voicemail" ? <VoicemailInbox /> : null}
      {tab === "messages" ? <MessagesPane /> : null}
      {tab === "reception" ? <ReceptionistBuilder /> : null}
      {tab === "queues" ? <CallQueuePanel /> : null}
      {tab === "attendant" ? <AttendantConsole /> : null}
      {tab === "ivr" ? <IVRBuilder /> : null}
      {tab === "routing" ? <RoutingRuleBuilder /> : null}
      {tab === "analytics" ? <CallAnalytics /> : null}
    </div>
  );
}
