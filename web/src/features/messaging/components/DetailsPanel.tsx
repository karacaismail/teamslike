import { useTranslation } from "react-i18next";
import { X, Star, FileText, LinkSimple, Image as ImageIcon, Timer, LockKey } from "@/lib/icons";
import { useMessagingStore } from "../store";
import { TEAM } from "@/data/team";
import { memberById } from "../members";
import { Avatar } from "@/components/ui/Avatar";
import { PresenceDot } from "@/components/ui/PresenceDot";
import { Badge, IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { ConvPriority, DisappearTimer } from "../types";

const PRIORITIES: ConvPriority[] = ["urgent", "high", "medium", "low"];
const TIMERS: DisappearTimer[] = ["off", "24h", "7d"];

export function DetailsPanel() {
  const { t } = useTranslation();
  const { channels, activeChannelId, toggleDetails, setPriority, setDisappearing, submitCsat } =
    useMessagingStore();
  const channel = channels.find((c) => c.id === activeChannelId);
  if (!channel) return null;

  const isDm = channel.kind === "dm";
  const contact = channel.dmUserId ? memberById(channel.dmUserId) : undefined;

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={toggleDetails} aria-hidden />
      <aside
        aria-label={t("messaging.details")}
        className="fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-border bg-surface shadow-2xl lg:static lg:z-auto lg:w-72 lg:max-w-none lg:shadow-none"
      >
      <header className="flex items-center justify-between border-b border-border p-3">
        <span className="text-base font-semibold text-fg">{t("messaging.details")}</span>
        <IconButton label={t("messaging.closePanel")} onClick={toggleDetails}>
          <X size={20} aria-hidden />
        </IconButton>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex flex-col items-center text-center">
          <span className="relative inline-block">
            <Avatar name={channel.name} size={64} />
            {contact ? <PresenceDot presence={contact.presence} className="absolute bottom-1 right-1" /> : null}
          </span>
          <div className="mt-2 text-lg font-semibold text-fg">{channel.name}</div>
          <div className="flex flex-wrap items-center justify-center gap-1 text-base text-muted">
            {isDm ? t("messaging.directMessage") : t("messaging.channels")}
            {channel.e2ee ? <Badge tone="positive"><LockKey size={12} aria-hidden /> {t("messaging.e2ee")}</Badge> : null}
            {channel.label ? <Badge tone="neutral">{channel.label}</Badge> : null}
          </div>
        </div>

        {/* Members (channel) */}
        {!isDm ? (
          <section>
            <h3 className="mb-1 text-base font-semibold text-muted">{t("messaging.members")}</h3>
            <ul className="space-y-1">
              {TEAM.slice(0, 4).map((m) => (
                <li key={m.id} className="flex items-center gap-2">
                  <span className="relative inline-block">
                    <Avatar name={m.name} size={26} />
                    <PresenceDot presence={m.presence} className="absolute -bottom-0.5 -right-0.5" />
                  </span>
                  <span className="flex-1 truncate text-base text-fg">{m.name}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Priority (Chatwoot) */}
        {channel.isCustomer ? (
          <section>
            <h3 className="mb-1 text-base font-semibold text-muted">{t("messaging.priority")}</h3>
            <div className="flex flex-wrap gap-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(channel.id, p)}
                  aria-pressed={channel.priority === p}
                  className={cn(
                    "h-9 rounded-md border px-2 text-base",
                    channel.priority === p ? "border-accent bg-surface text-accent" : "border-border text-muted hover:bg-raised",
                  )}
                >
                  {t(`messaging.priorityLevel.${p}`)}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {/* Disappearing messages (WhatsApp/Telegram) */}
        <section>
          <h3 className="mb-1 flex items-center gap-1 text-base font-semibold text-muted">
            <Timer size={14} aria-hidden /> {t("messaging.disappearing")}
          </h3>
          <div className="flex gap-1">
            {TIMERS.map((d) => (
              <button
                key={d}
                onClick={() => setDisappearing(channel.id, d)}
                aria-pressed={(channel.disappearing ?? "off") === d}
                className={cn(
                  "h-9 flex-1 rounded-md border text-base",
                  (channel.disappearing ?? "off") === d ? "border-accent bg-surface text-accent" : "border-border text-muted hover:bg-raised",
                )}
              >
                {t(`messaging.timer.${d}`)}
              </button>
            ))}
          </div>
        </section>

        {/* Shared (mock) */}
        <section>
          <h3 className="mb-1 text-base font-semibold text-muted">{t("messaging.shared")}</h3>
          <div className="grid grid-cols-3 gap-2 text-center text-base">
            <div className="rounded-md border border-border p-2">
              <ImageIcon size={18} className="mx-auto text-muted" aria-hidden />
              <div className="mt-1 text-fg">3</div>
            </div>
            <div className="rounded-md border border-border p-2">
              <FileText size={18} className="mx-auto text-muted" aria-hidden />
              <div className="mt-1 text-fg">12</div>
            </div>
            <div className="rounded-md border border-border p-2">
              <LinkSimple size={18} className="mx-auto text-muted" aria-hidden />
              <div className="mt-1 text-fg">4</div>
            </div>
          </div>
        </section>

        {/* CSAT (Chatwoot) */}
        {channel.isCustomer ? (
          <section>
            <h3 className="mb-1 text-base font-semibold text-muted">{t("messaging.csat")}</h3>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => submitCsat(channel.id, n)}
                  aria-label={t("messaging.csatRate", { n })}
                  aria-pressed={(channel.csat ?? 0) >= n}
                  className="rounded-md p-1 hover:bg-raised"
                >
                  <Star
                    size={22}
                    weight={(channel.csat ?? 0) >= n ? "fill" : "regular"}
                    className={(channel.csat ?? 0) >= n ? "text-warning" : "text-muted"}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      </aside>
    </>
  );
}
