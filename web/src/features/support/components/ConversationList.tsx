import { useTranslation } from "react-i18next";
import { Clock, WarningCircle, Tray } from "@/lib/icons";
import { useConversationStore } from "../conversationStore";
import { useInboxStore } from "../inboxStore";
import { useTenantStore } from "@/store/tenantStore";
import { slaState } from "../support";
import { INBOXES } from "../data";
import { contactName, PRIORITY, CHANNEL_ICON } from "./shared";
import { Badge, EmptyState, ListSkeleton } from "@/components/ui/primitives";
import { useFirstLoad } from "@/lib/useFirstLoad";
import { cn } from "@/lib/cn";

export function ConversationList() {
  const { t } = useTranslation();
  const conversations = useConversationStore((s) => s.conversations);
  const activeId = useConversationStore((s) => s.activeConversationId);
  const setActive = useConversationStore((s) => s.setActive);
  const activeInboxId = useInboxStore((s) => s.activeInboxId);
  const filterStatus = useInboxStore((s) => s.filterStatus);
  const workspaceId = useTenantStore((s) => s.workspaceId);
  const firstLoad = useFirstLoad();

  const list = conversations
    // Inbox is scoped to the active workspace (J5); untagged = visible everywhere.
    .filter((c) => c.workspaceId == null || c.workspaceId === workspaceId)
    .filter((c) => !activeInboxId || c.inboxId === activeInboxId)
    .filter((c) => filterStatus === "all" || c.status === filterStatus);

  if (firstLoad)
    return <ListSkeleton rows={7} label={t("common.loading")} className="min-h-0 flex-1" />;

  return (
    <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto" aria-label={t("support.conversations")}>
      {list.length === 0 ? (
        <li>
          <EmptyState icon={<Tray size={28} aria-hidden />} title={t("support.empty")} />
        </li>
      ) : (
        list.map((c) => {
          const inbox = INBOXES.find((i) => i.id === c.inboxId);
          const Channel = inbox ? CHANNEL_ICON[inbox.channelType] : CHANNEL_ICON.livechat;
          const { Icon: PIcon, tone } = PRIORITY[c.priority];
          const sla = slaState(c.slaDueAt);
          const last = c.messages.at(-1);
          return (
            <li key={c.id}>
              <button
                onClick={() => setActive(c.id)}
                aria-current={activeId === c.id}
                className={cn(
                  "flex w-full flex-col gap-1 px-3 py-2 text-left",
                  activeId === c.id ? "bg-surface" : "hover:bg-surface",
                )}
              >
                <div className="flex items-center gap-2">
                  <Channel size={16} className="text-muted" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-base font-medium text-fg">{contactName(c.contactId)}</span>
                  {c.unread > 0 ? <Badge tone="accent">{c.unread}</Badge> : null}
                </div>
                {last ? <div className="truncate text-base text-muted">{last.body}</div> : null}
                <div className="flex flex-wrap items-center gap-1.5 text-base">
                  <span className={cn("inline-flex items-center gap-1", tone)}>
                    <PIcon size={14} aria-hidden /> {t(`support.priority.${c.priority}`)}
                  </span>
                  <Badge tone="neutral">{t(`support.status.${c.status}`)}</Badge>
                  {sla === "breached" ? (
                    <Badge tone="danger"><WarningCircle size={12} aria-hidden /> {t("support.sla.breached")}</Badge>
                  ) : sla === "due_soon" ? (
                    <Badge tone="warning"><Clock size={12} aria-hidden /> {t("support.sla.dueSoon")}</Badge>
                  ) : null}
                  {c.labels.map((l) => (
                    <span key={l} className="rounded-sm border border-border px-1.5 text-muted">{l}</span>
                  ))}
                </div>
              </button>
            </li>
          );
        })
      )}
    </ul>
  );
}
