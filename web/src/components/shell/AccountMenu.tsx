import * as Menu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GearSix, SignOut, CaretRight } from "@/lib/icons";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui/Avatar";

/**
 * Account/profile card — bottom-left of the shell (Slack/Linear pattern), not
 * the old top-right. Opens upward into a menu with the profile/options page and
 * sign-out. See DESIGN-DECISIONS.md so this placement isn't regressed.
 */
export function AccountMenu({ onNavigate }: { onNavigate?: () => void } = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const principal = useAuthStore((s) => s.principal);
  const logout = useAuthStore((s) => s.logout);
  if (!principal) return null;

  const itemCls =
    "flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface";

  return (
    <div className="border-t border-border p-2">
      <Menu.Root>
        <Menu.Trigger className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <Avatar name={principal.displayName} size={32} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-medium text-fg">{principal.displayName}</span>
            <span className="block truncate text-base text-muted">{t(`role.${principal.role}`)}</span>
          </span>
          <CaretRight size={16} className="text-muted" aria-hidden />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content
            side="top"
            align="start"
            sideOffset={8}
            className="z-50 w-60 rounded-lg border border-border bg-raised p-2 shadow-xl"
          >
            <div className="px-2 py-1">
              <div className="truncate text-base font-semibold text-fg">{principal.displayName}</div>
              <div className="truncate text-base text-muted">{principal.email}</div>
              <div className="mt-0.5 text-base text-accent">{t(`role.${principal.role}`)}</div>
            </div>
            <Menu.Separator className="my-1 h-px bg-border" />
            <Menu.Item onSelect={() => { navigate("/profile"); onNavigate?.(); }} className={itemCls}>
              <GearSix size={18} aria-hidden /> {t("profile.settings")}
            </Menu.Item>
            <Menu.Item onSelect={() => { logout(); onNavigate?.(); }} className={itemCls}>
              <SignOut size={18} aria-hidden /> {t("shell.signOut")}
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
