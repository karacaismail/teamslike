import * as React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { List, X } from "@/lib/icons";
import { DOMAINS } from "@/data/domains";
import { useAuthStore } from "@/store/authStore";
import { PrimaryNav } from "./PrimaryNav";
import { cn } from "@/lib/cn";

/** How many domains sit directly on the bottom bar; the rest move into "More". */
const BAR_COUNT = 4;

/**
 * Compact bottom navigation for mobile (< md). The desktop sidebar is hidden at
 * this breakpoint, so without this the primary nav disappears entirely. Shows
 * the first few RBAC-permitted domains as icon targets plus a "More" sheet that
 * reuses the full labelled `PrimaryNav`. Hidden on desktop via `md:hidden`.
 *
 * Icon-only to honour the project's 1rem minimum text size; every target keeps
 * an accessible label, and the sheet exposes full text labels.
 */
export function MobileNav() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.can);
  const items = DOMAINS.filter((d) => can(d.requires));
  const onBar = items.slice(0, BAR_COUNT);
  const [moreOpen, setMoreOpen] = React.useState(false);

  const cell =
    "flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-[3.25rem] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

  return (
    <>
      {moreOpen ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.primary")}
        >
          <button
            type="button"
            aria-label={t("common.close")}
            className="absolute inset-0 bg-overlay"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[72vh] overflow-y-auto rounded-t-xl border-t border-border bg-raised">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-base font-semibold text-fg">{t("nav.primary")}</span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label={t("common.close")}
                className="flex h-11 w-11 items-center justify-center rounded-md text-fg hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X size={22} aria-hidden />
              </button>
            </div>
            {/* Any nav click dismisses the sheet. */}
            <div onClick={() => setMoreOpen(false)}>
              <PrimaryNav />
            </div>
          </div>
        </div>
      ) : null}

      <nav
        aria-label={t("nav.primary")}
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-raised md:hidden"
      >
        {onBar.map((d) => {
          const Icon = d.icon;
          return (
            <NavLink
              key={d.key}
              to={d.path}
              aria-label={t(d.labelKey)}
              title={t(d.labelKey)}
              className={({ isActive }) =>
                cn(cell, isActive ? "text-accent" : "text-muted")
              }
            >
              {({ isActive }) => (
                <Icon size={24} weight={isActive ? "fill" : "regular"} aria-hidden />
              )}
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          className={cn(cell, "text-muted")}
        >
          <List size={24} aria-hidden />
          <span className="sr-only">{t("nav.more")}</span>
        </button>
      </nav>
    </>
  );
}
