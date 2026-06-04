import * as React from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlass, BookOpen } from "@/lib/icons";
import { searchKb } from "../support";
import { KB_ARTICLES } from "../data";
import { Card } from "@/components/ui/primitives";

export function KbPanel() {
  const { t } = useTranslation();
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState<string | null>(null);
  const results = searchKb(KB_ARTICLES, q);

  return (
    <Card className="p-3">
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
        <BookOpen size={16} aria-hidden /> {t("support.kb")}
      </h3>
      <div className="relative mb-2">
        <MagnifyingGlass size={14} aria-hidden className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("support.kbSearch")}
          aria-label={t("support.kbSearch")}
          className="h-10 w-full rounded-md border border-border bg-bg pl-7 pr-2 text-base text-fg outline-none placeholder:text-muted"
        />
      </div>
      <ul className="space-y-1">
        {results.map((a) => (
          <li key={a.id}>
            <button onClick={() => setOpen((o) => (o === a.id ? null : a.id))} className="w-full rounded-md px-2 py-1 text-left text-base text-fg hover:bg-surface">
              {a.title}
            </button>
            {open === a.id ? <p className="px-2 pb-1 text-base text-muted">{a.body}</p> : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}
