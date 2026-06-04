import { useTranslation } from "react-i18next";
import { Tray } from "@/lib/icons";
import { useInboxStore, type StatusFilter } from "../inboxStore";
import { CHANNEL_ICON } from "./shared";
import { cn } from "@/lib/cn";

const STATUSES: StatusFilter[] = ["all", "open", "pending", "snoozed", "resolved"];

export function InboxNav() {
  const { t } = useTranslation();
  const { inboxes, activeInboxId, filterStatus, setInbox, setFilter } = useInboxStore();

  return (
    <div className="hidden w-48 shrink-0 flex-col gap-3 border-r border-border bg-raised p-3 md:flex">
      <div>
        <h3 className="mb-1 text-base font-semibold text-muted">{t("support.inboxes")}</h3>
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => setInbox(null)}
              aria-current={activeInboxId === null}
              className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-base", activeInboxId === null ? "bg-surface text-fg" : "text-muted hover:bg-surface")}
            >
              <Tray size={16} aria-hidden /> {t("support.allInboxes")}
            </button>
          </li>
          {inboxes.map((ib) => {
            const Icon = CHANNEL_ICON[ib.channelType];
            return (
              <li key={ib.id}>
                <button
                  onClick={() => setInbox(ib.id)}
                  aria-current={activeInboxId === ib.id}
                  className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-base", activeInboxId === ib.id ? "bg-surface text-fg" : "text-muted hover:bg-surface")}
                >
                  <Icon size={16} aria-hidden /> {ib.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="mb-1 text-base font-semibold text-muted">{t("support.filter")}</h3>
        <div className="flex flex-wrap gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              aria-pressed={filterStatus === s}
              className={cn("rounded-md border px-2 py-0.5 text-base", filterStatus === s ? "border-accent text-accent" : "border-border text-muted hover:bg-surface")}
            >
              {s === "all" ? t("support.statusAll") : t(`support.status.${s}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
