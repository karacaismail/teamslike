import * as React from "react";
import { Forbidden } from "@/components/ui/Forbidden";
import { useTranslation } from "react-i18next";
import { Prohibit, FileText, Kanban, Lightning, VideoCamera, SquaresFour, Table } from "@/lib/icons";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { useTabKeys } from "@/lib/useTabKeys";
import { useUrlSelection } from "@/lib/useUrlSelection";
import type { IconType } from "@/types/domain";
import { CanvasEditor } from "./components/CanvasEditor";
import { CommentSidebar } from "./components/CommentSidebar";
import { KanbanBoard } from "./components/KanbanBoard";
import { TableGridView } from "./components/TableGridView";
import { WorkflowBuilder } from "./components/WorkflowBuilder";
import { ClipsList } from "./components/ClipsList";
import { AppsPanel } from "./components/AppsPanel";

type Tab = "canvas" | "board" | "table" | "workflows" | "clips" | "apps";
const TABS: { id: Tab; Icon: IconType }[] = [
  { id: "canvas", Icon: FileText },
  { id: "board", Icon: Kanban },
  { id: "table", Icon: Table },
  { id: "workflows", Icon: Lightning },
  { id: "clips", Icon: VideoCamera },
  { id: "apps", Icon: SquaresFour },
];

export function DocsPage() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.can);
  const [tab, setTab] = React.useState<Tab>("canvas");
  const onTabKey = useTabKeys(TABS.map((x) => x.id), tab, setTab);
  // Deep-link the active tab (?tab=) — shareable + reload-safe (J2).
  useUrlSelection("tab", tab, (v) => setTab(v as Tab), (v) => TABS.some((x) => x.id === v));

  if (!can("docs.view")) {
    return <Forbidden />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div>
        <h1 className="text-3xl font-bold text-fg">{t("nav.docs")}</h1>
        <p className="mt-1 text-base text-muted">{t("docs.subtitle")}</p>
      </div>

      <div role="tablist" aria-label={t("nav.docs")} className="flex flex-wrap gap-1 border-b border-border">
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
            <Icon size={18} aria-hidden /> {t(`docs.tabs.${id}`)}
          </button>
        ))}
      </div>

      {tab === "canvas" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
          <CanvasEditor />
          <CommentSidebar />
        </div>
      ) : null}
      {tab === "board" ? <KanbanBoard /> : null}
      {tab === "table" ? <TableGridView /> : null}
      {tab === "workflows" ? <WorkflowBuilder /> : null}
      {tab === "clips" ? <ClipsList /> : null}
      {tab === "apps" ? <AppsPanel /> : null}
    </div>
  );
}
