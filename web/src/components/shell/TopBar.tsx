import { useTranslation } from "react-i18next";
import { MagnifyingGlass, Sparkle } from "@/lib/icons";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { NotificationBell } from "./NotificationBell";
import { useUIStore } from "@/store/uiStore";
import { IconButton, Kbd } from "@/components/ui/primitives";

/**
 * Top bar: brand, workspace switcher, command search, notifications, copilot.
 * Account/profile and settings moved OUT of here to the bottom-left account
 * card → /profile page (see DESIGN-DECISIONS.md), which also declutters the bar
 * on mobile.
 */
export function TopBar() {
  const { t } = useTranslation();
  const togglePalette = useUIStore((s) => s.togglePalette);
  const toggleCopilot = useUIStore((s) => s.toggleCopilot);

  return (
    <header
      role="banner"
      className="flex h-16 items-center gap-3 border-b border-border bg-raised px-4"
    >
      <div className="flex items-center gap-2">
        <Sparkle size={26} weight="fill" className="text-accent" aria-hidden />
        {/* Wordmark yields to the search field on the narrowest screens (M6). */}
        <span className="hidden text-xl font-bold text-fg sm:inline">{t("app.name")}</span>
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
        <span className="hidden sm:inline-flex">
          <Kbd>⌘K</Kbd>
        </span>
      </button>

      <NotificationBell />

      <IconButton label={t("shell.copilot")} onClick={toggleCopilot}>
        <Sparkle size={22} aria-hidden />
      </IconButton>
    </header>
  );
}
