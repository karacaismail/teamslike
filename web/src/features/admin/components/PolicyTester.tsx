import * as React from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "@/lib/icons";
import { dlpScan, flaggedTerms, barrierBlocks, sensitivityRank } from "../admin";
import { Badge, Card } from "@/components/ui/primitives";
import type { SensitivityLabel } from "../types";

const LABELS: SensitivityLabel[] = ["public", "general", "confidential", "restricted"];
const SUPERVISED = ["insider", "bribe", "leak"];
const BARRIERS: [string, string][] = [["Research", "Sales"]];

/** Live tester surfacing the governance utils (DLP / supervised terms / barriers / labels). */
export function PolicyTester() {
  const { t } = useTranslation();
  const [text, setText] = React.useState("Pay 4111 1111 1111 1111 — don't leak this.");
  const [from, setFrom] = React.useState("Research");
  const [to, setTo] = React.useState("Sales");
  const [label, setLabel] = React.useState<SensitivityLabel>("confidential");

  const dlp = dlpScan(text);
  const flagged = flaggedTerms(text, SUPERVISED);
  const blocked = barrierBlocks(from, to, BARRIERS);

  return (
    <Card>
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
        <ShieldCheck size={18} aria-hidden /> {t("admin.tester.title")}
      </h3>

      <label className="block">
        <span className="mb-1 block text-base text-muted">{t("admin.tester.text")}</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-border bg-bg p-2 text-base text-fg outline-none"
        />
      </label>

      <div className="mt-2 flex flex-wrap gap-2">
        <Badge tone={dlp.length ? "danger" : "positive"}>
          {t("admin.tester.dlp", { n: dlp.length })}{dlp.length ? `: ${dlp.map((d) => d.kind).join(", ")}` : ""}
        </Badge>
        <Badge tone={flagged.length ? "warning" : "positive"}>
          {t("admin.tester.flagged", { n: flagged.length })}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
        <label className="flex flex-col gap-1 text-base text-muted">
          {t("admin.tester.from")}
          <input value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 rounded-md border border-border bg-bg px-2 text-base text-fg" />
        </label>
        <label className="flex flex-col gap-1 text-base text-muted">
          {t("admin.tester.to")}
          <input value={to} onChange={(e) => setTo(e.target.value)} className="h-10 rounded-md border border-border bg-bg px-2 text-base text-fg" />
        </label>
        <Badge tone={blocked ? "danger" : "positive"}>
          {blocked ? t("admin.tester.barrierBlocked") : t("admin.tester.barrierOk")}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-base text-muted">{t("admin.tester.label")}</span>
        {LABELS.map((l) => (
          <button
            key={l}
            aria-pressed={label === l}
            onClick={() => setLabel(l)}
            className={label === l ? "rounded-md border border-accent px-2 py-1 text-base text-accent" : "rounded-md border border-border px-2 py-1 text-base text-muted hover:bg-surface"}
          >
            {l}
          </button>
        ))}
        <Badge tone="neutral">{t("admin.tester.rank", { n: sensitivityRank(label) })}</Badge>
      </div>
    </Card>
  );
}
