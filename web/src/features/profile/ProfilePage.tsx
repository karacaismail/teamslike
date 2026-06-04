import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useUIStore, type Theme, type Density, type Locale } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { ROLES, ROLE_ORDER } from "@/data/roles";
import { THEME_COLORS, readableOn } from "@/lib/themeColors";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/primitives";
import { Check } from "@/lib/icons";
import { cn } from "@/lib/cn";
import type { RoleKey } from "@/types/domain";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-base font-medium text-fg">{label}</div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-md border border-border p-1" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "h-9 rounded-md px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            value === o.value ? "bg-accent text-accent-fg" : "text-fg hover:bg-surface",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Profile / options page — personal appearance (theme, density, accent colour),
 *  language, and (RBAC-gated) demo role. Reached from the bottom-left account
 *  card. */
export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { theme, density, locale, accentColor, setTheme, setDensity, setLocale, setAccentColor } = useUIStore();
  const principal = useAuthStore((s) => s.principal);
  const setRole = useAuthStore((s) => s.setRole);
  const can = useAuthStore((s) => s.can);
  if (!principal) return null;

  const canSwitchRole = can("admin.access");
  const isActive = (hex: string) => (accentColor ?? "").toLowerCase() === hex.toLowerCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center gap-4">
        <Avatar name={principal.displayName} size={56} />
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-bold text-fg">{principal.displayName}</h1>
          <p className="truncate text-base text-muted">
            {principal.email} · {t(`role.${principal.role}`)}
          </p>
        </div>
      </header>

      <Card className="space-y-5">
        <h2 className="text-xl font-semibold text-fg">{t("profile.appearance")}</h2>

        <Field label={t("shell.theme")}>
          <Segmented
            label={t("shell.theme")}
            value={theme}
            onChange={(v) => setTheme(v as Theme)}
            options={[
              { value: "light", label: t("shell.themeLight") },
              { value: "dark", label: t("shell.themeDark") },
              { value: "high-contrast", label: t("shell.themeContrast") },
            ]}
          />
        </Field>

        <Field label={t("shell.density")}>
          <Segmented
            label={t("shell.density")}
            value={density}
            onChange={(v) => setDensity(v as Density)}
            options={[
              { value: "comfortable", label: t("shell.densityComfortable") },
              { value: "compact", label: t("shell.densityCompact") },
            ]}
          />
        </Field>

        <Field label={t("profile.accent")}>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAccentColor(null)}
              aria-pressed={accentColor === null}
              className={cn(
                "h-9 rounded-md border px-3 text-base",
                accentColor === null ? "border-accent text-accent" : "border-border text-muted hover:bg-surface",
              )}
            >
              {t("profile.accentDefault")}
            </button>
            {THEME_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setAccentColor(c.hex)}
                aria-pressed={isActive(c.hex)}
                aria-label={t("profile.pickColor", { name: c.name })}
                title={`${c.name} · ${c.hex}`}
                className={cn(
                  "relative h-9 w-9 rounded-full border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  isActive(c.hex) && "ring-2 ring-accent ring-offset-2 ring-offset-bg",
                )}
                style={{ backgroundColor: c.hex }}
              >
                {isActive(c.hex) ? (
                  <Check size={16} aria-hidden className="absolute inset-0 m-auto" style={{ color: readableOn(c.hex) }} />
                ) : null}
              </button>
            ))}
          </div>
        </Field>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-fg">{t("shell.language")}</h2>
        <Segmented
          label={t("shell.language")}
          value={locale}
          onChange={(v) => {
            setLocale(v as Locale);
            void i18n.changeLanguage(v);
          }}
          options={[
            { value: "en", label: "English" },
            { value: "tr", label: "Türkçe" },
          ]}
        />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">{t("shell.demoRole")}</h2>
        {canSwitchRole ? (
          <Segmented
            label={t("shell.demoRole")}
            value={principal.role}
            onChange={(v) => setRole(v as RoleKey)}
            options={ROLE_ORDER.map((r) => ({ value: r, label: t(ROLES[r].labelKey) }))}
          />
        ) : (
          <p className="text-base text-muted">{t("profile.roleLocked", { role: t(`role.${principal.role}`) })}</p>
        )}
      </Card>
    </div>
  );
}
