import * as React from "react";
import { useTranslation } from "react-i18next";
import { Plus, ShareNetwork } from "@/lib/icons";
import { useAdminStore } from "../adminStore";
import { Badge, Button, Card } from "@/components/ui/primitives";

export function FederationSettings() {
  const { t } = useTranslation();
  const federation = useAdminStore((s) => s.federation);
  const addBridge = useAdminStore((s) => s.addBridge);
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});

  return (
    <div className="space-y-3">
      {federation.map((f) => (
        <Card key={f.id}>
          <div className="mb-2 flex items-center gap-2">
            <ShareNetwork size={18} className="text-muted" aria-hidden />
            <span className="text-base font-semibold text-fg">{f.protocol} · {f.remote}</span>
            <Badge tone={f.connected ? "positive" : "neutral"} className="ml-auto">
              {f.connected ? t("admin.connected") : t("admin.disconnected")}
            </Badge>
          </div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {f.bridges.map((b) => (
              <Badge key={b} tone="accent">{b}</Badge>
            ))}
            {f.bridges.length === 0 ? <span className="text-base text-muted">{t("admin.noBridges")}</span> : null}
          </div>
          <div className="flex items-end gap-2">
            <input
              value={drafts[f.id] ?? ""}
              onChange={(e) => setDrafts((d) => ({ ...d, [f.id]: e.target.value }))}
              placeholder={t("admin.bridgePh")}
              aria-label={t("admin.bridgePh")}
              className="h-10 flex-1 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none placeholder:text-muted"
            />
            <Button
              disabled={!(drafts[f.id] ?? "").trim()}
              onClick={() => { addBridge(f.id, (drafts[f.id] ?? "").trim()); setDrafts((d) => ({ ...d, [f.id]: "" })); }}
            >
              <Plus size={16} aria-hidden /> {t("admin.addBridge")}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
