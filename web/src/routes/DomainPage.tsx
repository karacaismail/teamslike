import { useTranslation } from "react-i18next";
import { Sparkle } from "@/lib/icons";
import { DOMAIN_BY_KEY } from "@/data/domains";
import { MOCK_DOMAIN_STATS } from "@/lib/mockData";
import type { DomainKey } from "@/types/domain";
import { useAskCopilot } from "@/lib/useCopilot";
import { StatCard, Badge, Button, Card } from "@/components/ui/primitives";

/**
 * Generic domain preview screen (Phase 1 scaffold). Each domain ships its full
 * experience in its roadmap phase; here we render the domain identity, RBAC-
 * gated entry, headline mock stats, and an AI-orchestration entry point.
 */
export function DomainPage({ domainKey }: { domainKey: DomainKey }) {
  const { t } = useTranslation();
  const meta = DOMAIN_BY_KEY[domainKey];
  const stats = MOCK_DOMAIN_STATS[domainKey] ?? [];
  const Icon = meta.icon;
  const ask = useAskCopilot();

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface text-accent">
          <Icon size={30} weight="fill" aria-hidden />
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold text-fg">{t(meta.labelKey)}</h1>
            <Badge tone="accent">{t("domain.phaseLabel", { n: meta.phase })}</Badge>
            <Badge tone="warning">{t("common.mockBadge")}</Badge>
          </div>
          <p className="mt-1 text-base text-muted">{t(meta.descKey)}</p>
        </div>
      </div>

      <Card className="mt-6 border-dashed">
        <p className="text-base text-fg">{t("domain.previewNote")}</p>
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() =>
            ask(`Summarize what the ${t(meta.labelKey)} domain will do.`, t(meta.labelKey))
          }
        >
          <Sparkle size={20} aria-hidden />
          {t("domain.openCopilotCta")}
        </Button>
      </Card>

      {stats.length > 0 ? (
        <>
          <h2 className="mt-8 text-xl font-semibold text-fg">{t("common.overview")}</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <StatCard key={s.labelKey} label={t(s.labelKey)} value={s.value} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
