import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkle } from "@/lib/icons";
import { DOMAINS } from "@/data/domains";
import { MOCK_DOMAIN_STATS } from "@/lib/mockData";
import { TEAM } from "@/data/team";
import { ACTIVITY } from "@/data/notifications";
import { useAuthStore } from "@/store/authStore";
import { useAskCopilot } from "@/lib/useCopilot";
import { relTime } from "@/lib/time";
import { StatCard, Card } from "@/components/ui/primitives";
import { WidgetBoundary } from "@/components/ui/WidgetBoundary";
import { Avatar } from "@/components/ui/Avatar";
import { PresenceDot } from "@/components/ui/PresenceDot";
import type { CopilotSuggestion } from "@/types/domain";

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const can = useAuthStore((s) => s.can);
  const name = useAuthStore((s) => s.principal?.displayName ?? "");
  const ask = useAskCopilot();

  const stats = MOCK_DOMAIN_STATS.dashboard;
  const suggestions = t("dashboard.sugg", { returnObjects: true }) as unknown as CopilotSuggestion[];
  const domainCards = DOMAINS.filter((d) => d.key !== "dashboard" && can(d.requires));

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold text-fg">{t("dashboard.welcome", { name })}</h1>
      <p className="mt-1 text-base text-muted">{t("dashboard.subtitle")}</p>

      {/* AI-first: proactive copilot suggestions. Isolated so a malformed
          i18n suggestion payload degrades to an inline notice, not a blank page. */}
      {can("ai.use") ? (
        <WidgetBoundary>
        <section className="mt-6" aria-label={t("dashboard.aiSuggestions")}>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-fg">
            <Sparkle size={22} weight="fill" className="text-accent" aria-hidden />
            {t("dashboard.aiSuggestions")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.isArray(suggestions)
              ? suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => ask(s.prompt, t("nav.dashboard"))}
                    className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-raised p-4 text-left hover:border-accent"
                  >
                    <span className="text-base font-medium text-fg">{s.label}</span>
                    <ArrowRight
                      size={18}
                      className="text-accent transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </button>
                ))
              : null}
          </div>
        </section>
        </WidgetBoundary>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.labelKey} label={t(s.labelKey)} value={s.value} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <WidgetBoundary>
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-fg">{t("dashboard.activity")}</h2>
          <ul className="mt-3 space-y-3">
            {ACTIVITY.map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <Avatar name={a.actor} size={32} />
                <button
                  type="button"
                  onClick={() => a.href && navigate(a.href)}
                  disabled={!a.href}
                  className="flex-1 rounded-md px-1 py-0.5 text-left text-base text-fg enabled:hover:bg-surface disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {t(`activity.${a.kind}`, { actor: a.actor, target: a.target })}
                </button>
                <span className="text-base text-muted">{relTime(t, a.tMinutes)}</span>
              </li>
            ))}
          </ul>
        </Card>
        </WidgetBoundary>

        {can("members.view") ? (
          <WidgetBoundary>
          <Card>
            <h2 className="text-xl font-semibold text-fg">{t("dashboard.team")}</h2>
            <ul className="mt-3 space-y-3">
              {TEAM.slice(0, 5).map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <span className="relative inline-block">
                    <Avatar name={m.name} size={32} />
                    <PresenceDot
                      presence={m.presence}
                      className="absolute -bottom-0.5 -right-0.5"
                    />
                  </span>
                  <span className="flex-1 truncate text-base text-fg">{m.name}</span>
                  <span className="text-base text-muted">{t(`presence.${m.presence}`)}</span>
                </li>
              ))}
            </ul>
          </Card>
          </WidgetBoundary>
        ) : null}
      </div>

      <h2 className="mt-8 text-xl font-semibold text-fg">{t("dashboard.recentDomains")}</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {domainCards.map((d) => {
          const Icon = d.icon;
          return (
            <Link
              key={d.key}
              to={d.path}
              className="group rounded-lg border border-border bg-raised p-5 transition-colors hover:border-accent"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-surface text-accent">
                  <Icon size={24} weight="fill" aria-hidden />
                </span>
                <span className="text-lg font-semibold text-fg">{t(d.labelKey)}</span>
              </div>
              <p className="mt-2 text-base text-muted">{t(d.descKey)}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-base text-accent">
                {t("domain.phaseLabel", { n: d.phase })}
                <ArrowRight size={16} aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
