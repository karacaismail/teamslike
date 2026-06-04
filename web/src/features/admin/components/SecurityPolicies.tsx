import { useTranslation } from "react-i18next";
import { LockKey, MapPin, Trash, ShieldCheck, Tag, Gavel, Wall, Eye, Fingerprint } from "@/lib/icons";
import { useAdminStore } from "../adminStore";
import { Badge, Card } from "@/components/ui/primitives";
import { ConfirmAction } from "./ConfirmAction";
import { PolicyTester } from "./PolicyTester";
import type { PolicyKind } from "../types";

const ICON: Record<PolicyKind, typeof LockKey> = {
  residency: MapPin,
  retention: Trash,
  e2ee: LockKey,
  dlp: ShieldCheck,
  sensitivity: Tag,
  legalHold: Gavel,
  infoBarrier: Wall,
  commCompliance: Eye,
  conditionalAccess: Fingerprint,
};

export function SecurityPolicies() {
  const { t } = useTranslation();
  const policies = useAdminStore((s) => s.policies);
  const togglePolicy = useAdminStore((s) => s.togglePolicy);
  const setPolicyConfig = useAdminStore((s) => s.setPolicyConfig);

  return (
    <div className="space-y-3">
    <Card>
      <h3 className="mb-3 text-base font-semibold text-fg">{t("admin.security")}</h3>
      <ul className="space-y-2">
        {policies.map((p) => {
          const Icon = ICON[p.kind];
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-3">
              <Icon size={18} className="text-muted" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="text-base font-medium text-fg">{t(`admin.policy.${p.kind}`)}</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(p.config).map(([k, v]) => (
                    <label key={k} className="inline-flex items-center gap-1 text-base text-muted">
                      {k}:
                      <input
                        value={v}
                        onChange={(e) => setPolicyConfig(p.id, k, e.target.value)}
                        aria-label={`${t(`admin.policy.${p.kind}`)} · ${k}`}
                        className="h-8 w-32 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none"
                      />
                    </label>
                  ))}
                </div>
              </div>
              <Badge tone={p.enabled ? "positive" : "neutral"}>
                {p.enabled ? t("admin.enabled") : t("admin.disabled")}
              </Badge>
              <ConfirmAction
                label={p.enabled ? t("admin.disable") : t("admin.enable")}
                verifyWord={p.kind.toUpperCase()}
                variant={p.enabled ? "danger" : "primary"}
                onConfirm={() => togglePolicy(p.id)}
              />
            </li>
          );
        })}
      </ul>
    </Card>
    <PolicyTester />
    </div>
  );
}
