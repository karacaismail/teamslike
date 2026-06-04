import * as Menu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Bell, Checks } from "@/lib/icons";
import { useTranslation } from "react-i18next";
import { useNotificationStore } from "@/store/notificationStore";
import { useToastStore } from "@/store/toastStore";
import { relTime } from "@/lib/time";

export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = useNotificationStore((s) => s.items);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const push = useToastStore((s) => s.push);
  const unread = items.filter((n) => !n.read).length;

  // Clicking a notification marks it read AND jumps to its target (J3).
  const open = (id: string, href?: string) => {
    markRead(id);
    if (href) navigate(href);
  };

  return (
    <Menu.Root>
      <Menu.Trigger
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-md text-fg hover:bg-surface"
        aria-label={`${t("shell.notifications")}${unread ? ` (${unread})` : ""}`}
      >
        <Bell size={22} aria-hidden />
        {unread > 0 ? (
          <span className="absolute right-1.5 top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-danger px-1 text-base font-semibold text-white">
            {unread}
          </span>
        ) : null}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          align="end"
          sideOffset={6}
          className="z-50 w-[22rem] rounded-lg border border-border bg-raised p-2 shadow-xl"
        >
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-base font-semibold text-fg">
              {t("shell.notifications")}
            </span>
            <button
              onClick={() => {
                markAllRead();
                push({ title: t("notif.allRead"), tone: "positive" });
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-base text-accent hover:bg-surface"
            >
              <Checks size={18} aria-hidden />
              {t("notif.markAllRead")}
            </button>
          </div>

          {items.length === 0 ? (
            <p className="px-2 py-6 text-center text-base text-muted">
              {t("notif.empty")}
            </p>
          ) : (
            items.map((n) => (
              <Menu.Item
                key={n.id}
                onSelect={() => open(n.id, n.href)}
                className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-base outline-none data-[highlighted]:bg-surface"
              >
                <span
                  aria-hidden
                  className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-accent"}`}
                />
                <span className="flex-1 text-fg">
                  {t(`notif.${n.kind}`, { actor: n.actor, target: n.target })}
                  <span className="block text-base text-muted">
                    {relTime(t, n.tMinutes)}
                  </span>
                </span>
              </Menu.Item>
            ))
          )}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
