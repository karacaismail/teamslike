import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DOMAINS } from "@/data/domains";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

/** Secondary navigation. Items are RBAC-filtered by the active principal. */
export function PrimaryNav() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.can);
  const items = DOMAINS.filter((d) => can(d.requires));

  return (
    <nav
      aria-label={t("nav.primary")}
      className="flex h-full flex-col gap-1 overflow-y-auto p-3"
    >
      {items.map((d) => {
        const Icon = d.icon;
        return (
          <NavLink
            key={d.key}
            to={d.path}
            className={({ isActive }) =>
              cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-base transition-colors",
                isActive
                  ? "bg-accent text-accent-fg"
                  : "text-fg hover:bg-surface",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} weight={isActive ? "fill" : "regular"} aria-hidden />
                <span className="flex-1 truncate">{t(d.labelKey)}</span>
                {d.phase > 1 ? (
                  <Badge tone="neutral">{t("domain.phaseLabel", { n: d.phase })}</Badge>
                ) : null}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
