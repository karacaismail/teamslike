import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TopBar } from "./TopBar";
import { PrimaryNav } from "./PrimaryNav";
import { MobileNav } from "./MobileNav";
import { AccountMenu } from "./AccountMenu";
import { CopilotDock } from "./CopilotDock";
import { CommandPalette } from "./CommandPalette";
import { UnsavedNavGuard } from "./UnsavedNavGuard";
import { AsyncBoundary } from "@/components/ui/AsyncBoundary";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { ToastViewport } from "@/components/ui/Toast";
import { ActiveCallBar } from "@/features/telephony/components/ActiveCallBar";
import { useUIStore } from "@/store/uiStore";
import { useTenantStore } from "@/store/tenantStore";
import { MOCK_TENANTS } from "@/lib/mockData";
import { readableOn } from "@/lib/themeColors";

export function AppShell() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const theme = useUIStore((s) => s.theme);
  const density = useUIStore((s) => s.density);
  const locale = useUIStore((s) => s.locale);
  const copilotOpen = useUIStore((s) => s.copilotOpen);
  const accentColor = useUIStore((s) => s.accentColor);
  const togglePalette = useUIStore((s) => s.togglePalette);
  const tenantId = useTenantStore((s) => s.tenantId);

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  React.useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);
  React.useEffect(() => {
    document.documentElement.lang = locale;
    // Keep i18next in sync with the persisted/selected locale so a reload that
    // restores locale="tr" actually renders Turkish (J1/J7).
    if (i18n.language !== locale) void i18n.changeLanguage(locale);
  }, [locale, i18n]);

  // Live accent: the user's chosen colour wins (Profile → Appearance); else the
  // tenant's brand accent (light theme only). Text colour on the accent is
  // computed for legibility so even bright picks stay readable.
  React.useEffect(() => {
    const tenant = MOCK_TENANTS.find((x) => x.id === tenantId);
    const root = document.documentElement;
    const accent = accentColor ?? (tenant && theme === "light" ? tenant.branding.accent : null);
    if (accent) {
      root.style.setProperty("--accent", accent);
      root.style.setProperty("--ring", accent);
      root.style.setProperty("--accent-fg", readableOn(accent));
    } else {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--accent-fg");
    }
  }, [tenantId, theme, accentColor]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePalette]);

  return (
    <TooltipProvider>
      <a href="#main" className="skip-link">
        {t("shell.skipToContent")}
      </a>
      <div className="flex h-screen flex-col">
        <TopBar />
        <div className="flex min-h-0 flex-1">
          <aside
            data-testid="desktop-sidebar"
            className="hidden w-64 shrink-0 flex-col border-r border-border bg-raised md:flex"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <PrimaryNav />
            </div>
            {/* Account/profile lives at the BOTTOM-LEFT (Slack/Linear pattern),
                not the top-right. See DESIGN-DECISIONS.md. */}
            <AccountMenu />
          </aside>
          <main id="main" tabIndex={-1} className="min-w-0 flex-1 overflow-y-auto bg-bg pb-16 md:pb-0">
            {/* Keyed by route so a render error on one page is isolated to the
                content area AND clears when the user navigates away — no full
                reload needed (gemini §3.3). */}
            <AsyncBoundary key={pathname} label={t("common.loading")}>
              <Outlet />
            </AsyncBoundary>
          </main>
          {copilotOpen ? <CopilotDock /> : null}
        </div>
      </div>
      <CommandPalette />
      <UnsavedNavGuard />
      <ToastViewport />
      <ActiveCallBar />
      <MobileNav />
    </TooltipProvider>
  );
}
