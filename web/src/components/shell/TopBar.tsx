import * as Menu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import { MagnifyingGlass, Sparkle, GearSix, SignOut, Check } from "@/lib/icons";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { NotificationBell } from "./NotificationBell";
import { useUIStore, type Theme, type Density, type Locale } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { ROLES, ROLE_ORDER } from "@/data/roles";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton, Kbd } from "@/components/ui/primitives";
import type { RoleKey } from "@/types/domain";

function RadioRow({ value, label }: { value: string; label: string }) {
  return (
    <Menu.RadioItem
      value={value}
      className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface"
    >
      <span className="flex h-5 w-5 items-center justify-center">
        <Menu.ItemIndicator>
          <Check size={18} aria-hidden />
        </Menu.ItemIndicator>
      </span>
      <span className="flex-1">{label}</span>
    </Menu.RadioItem>
  );
}

export function TopBar() {
  const { t, i18n } = useTranslation();
  const { theme, density, locale, setTheme, setDensity, setLocale, togglePalette, toggleCopilot } =
    useUIStore();
  const { principal, logout, setRole } = useAuthStore();
  const push = useToastStore((s) => s.push);

  return (
    <header
      role="banner"
      className="flex h-16 items-center gap-3 border-b border-border bg-raised px-4"
    >
      <div className="flex items-center gap-2">
        <Sparkle size={26} weight="fill" className="text-accent" aria-hidden />
        <span className="text-xl font-bold text-fg">{t("app.name")}</span>
      </div>

      <div className="hidden md:block">
        <WorkspaceSwitcher />
      </div>

      <button
        onClick={togglePalette}
        className="ml-2 flex h-11 flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 text-base text-muted hover:bg-raised"
        aria-label={t("shell.openCommand")}
      >
        <MagnifyingGlass size={18} aria-hidden />
        <span className="flex-1 truncate text-left">{t("shell.searchPlaceholder")}</span>
        <Kbd>⌘K</Kbd>
      </button>

      <NotificationBell />

      <IconButton label={t("shell.copilot")} onClick={toggleCopilot}>
        <Sparkle size={22} aria-hidden />
      </IconButton>

      {/* Settings: theme / density / language / demo role */}
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton label={t("shell.settings")}>
            <GearSix size={22} aria-hidden />
          </IconButton>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content
            align="end"
            sideOffset={6}
            className="z-50 max-h-[80vh] w-60 overflow-y-auto rounded-lg border border-border bg-raised p-2 shadow-xl"
          >
            <Menu.Label className="px-2 py-1 text-base font-semibold text-muted">
              {t("shell.theme")}
            </Menu.Label>
            <Menu.RadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
              <RadioRow value="light" label={t("shell.themeLight")} />
              <RadioRow value="dark" label={t("shell.themeDark")} />
              <RadioRow value="high-contrast" label={t("shell.themeContrast")} />
            </Menu.RadioGroup>

            <Menu.Separator className="my-1 h-px bg-border" />
            <Menu.Label className="px-2 py-1 text-base font-semibold text-muted">
              {t("shell.density")}
            </Menu.Label>
            <Menu.RadioGroup value={density} onValueChange={(v) => setDensity(v as Density)}>
              <RadioRow value="comfortable" label={t("shell.densityComfortable")} />
              <RadioRow value="compact" label={t("shell.densityCompact")} />
            </Menu.RadioGroup>

            <Menu.Separator className="my-1 h-px bg-border" />
            <Menu.Label className="px-2 py-1 text-base font-semibold text-muted">
              {t("shell.language")}
            </Menu.Label>
            <Menu.RadioGroup
              value={locale}
              onValueChange={(v) => {
                setLocale(v as Locale);
                void i18n.changeLanguage(v);
              }}
            >
              <RadioRow value="en" label="English" />
              <RadioRow value="tr" label="Türkçe" />
            </Menu.RadioGroup>

            <Menu.Separator className="my-1 h-px bg-border" />
            <Menu.Label className="px-2 py-1 text-base font-semibold text-muted">
              {t("shell.demoRole")}
            </Menu.Label>
            <Menu.RadioGroup
              value={principal?.role}
              onValueChange={(v) => {
                setRole(v as RoleKey);
                push({ title: t("toast.roleChanged", { role: t(`role.${v}`) }) });
              }}
            >
              {ROLE_ORDER.map((r) => (
                <RadioRow key={r} value={r} label={t(ROLES[r].labelKey)} />
              ))}
            </Menu.RadioGroup>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>

      {/* Account */}
      <Menu.Root>
        <Menu.Trigger
          className="rounded-full focus-visible:outline-none"
          aria-label={t("shell.account")}
        >
          <Avatar name={principal?.displayName ?? "User"} />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content
            align="end"
            sideOffset={6}
            className="z-50 w-64 rounded-lg border border-border bg-raised p-2 shadow-xl"
          >
            <div className="px-2 py-2">
              <div className="text-base font-semibold text-fg">{principal?.displayName}</div>
              <div className="text-base text-muted">{principal?.email}</div>
              <div className="mt-1 text-base text-accent">
                {t(`role.${principal?.role}`)}
              </div>
            </div>
            <Menu.Separator className="my-1 h-px bg-border" />
            <Menu.Item
              onSelect={logout}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface"
            >
              <SignOut size={20} aria-hidden />
              <span>{t("shell.signOut")}</span>
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
    </header>
  );
}
