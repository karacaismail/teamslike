import * as React from "react";
import { Forbidden } from "@/components/ui/Forbidden";
import { useTranslation } from "react-i18next";
import { Prohibit, Tray, Robot, Gauge, Brain } from "@/lib/icons";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { useUrlSelection } from "@/lib/useUrlSelection";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { useTabKeys } from "@/lib/useTabKeys";
import type { IconType } from "@/types/domain";
import { useConversationStore } from "./conversationStore";
import { InboxNav } from "./components/InboxNav";
import { ConversationList } from "./components/ConversationList";
import { ConversationView } from "./components/ConversationView";
import { ContactPanel } from "./components/ContactPanel";
import { AutomationView } from "./components/AutomationView";
import { WorkforcePanel } from "./components/WorkforcePanel";
import { AgentStudio } from "./components/AgentStudio";

type View = "inbox" | "automation" | "workforce" | "studio";
const TABS: { id: View; Icon: IconType; labelKey: string }[] = [
  { id: "inbox", Icon: Tray, labelKey: "support.viewInbox" },
  { id: "automation", Icon: Robot, labelKey: "support.viewAutomation" },
  { id: "workforce", Icon: Gauge, labelKey: "support.viewWorkforce" },
  { id: "studio", Icon: Brain, labelKey: "support.viewStudio" },
];

export function SupportLayout() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.can);
  const [view, setView] = React.useState<View>("inbox");
  const onTabKey = useTabKeys(
    TABS.map((x) => x.id),
    view,
    setView,
  );

  // Deep-link the open conversation (?conv=…) so it's shareable / reload-safe
  // and notifications can target a specific ticket. (J2)
  const activeConversationId = useConversationStore((s) => s.activeConversationId);
  const setActiveConversation = useConversationStore((s) => s.setActive);
  const conversations = useConversationStore((s) => s.conversations);
  useUrlSelection(
    "conv",
    activeConversationId ?? "",
    setActiveConversation,
    (id) => conversations.some((c) => c.id === id),
  );

  // Re-select a conversation that belongs to the active workspace on switch (J5).
  const workspaceId = useTenantStore((s) => s.workspaceId);
  React.useEffect(() => {
    const visible = conversations.filter((c) => c.workspaceId == null || c.workspaceId === workspaceId);
    if (!visible.some((c) => c.id === activeConversationId)) {
      setActiveConversation(visible[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  if (!can("support.view")) {
    return <Forbidden />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div role="tablist" aria-label={t("nav.support")} className="flex items-center gap-1 border-b border-border bg-bg px-3 py-1.5">
        {TABS.map(({ id, Icon, labelKey }) => (
          <button
            key={id}
            role="tab"
            data-tab={id}
            aria-selected={view === id}
            tabIndex={view === id ? 0 : -1}
            onClick={() => setView(id)}
            onKeyDown={onTabKey}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              view === id ? "bg-accent text-accent-fg" : "text-fg hover:bg-surface",
            )}
          >
            <Icon size={16} aria-hidden /> {t(labelKey)}
          </button>
        ))}
      </div>

      {view === "inbox" ? (
        <div className="flex min-h-0 flex-1">
          <InboxNav />
          <div className="flex w-full max-w-[20rem] shrink-0 flex-col border-r border-border bg-bg md:w-80 md:max-w-none">
            <div className="border-b border-border px-3 py-2 text-base font-semibold text-fg">{t("nav.support")}</div>
            <ConversationList />
          </div>
          <ConversationView />
          <ContactPanel />
        </div>
      ) : view === "automation" ? (
        <AutomationView />
      ) : view === "workforce" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <WorkforcePanel />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <AgentStudio />
        </div>
      )}
    </div>
  );
}
