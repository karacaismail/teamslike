import * as React from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlass, Star, PhoneCall } from "@/lib/icons";
import { CONTACTS } from "../data";
import { searchContacts, formatNumber } from "../routing";
import { useCallStore } from "../callStore";
import { useDirectoryStore } from "../directoryStore";
import { Card, IconButton } from "@/components/ui/primitives";

export function Directory() {
  const { t } = useTranslation();
  const [q, setQ] = React.useState("");
  const place = useCallStore((s) => s.place);
  const active = useCallStore((s) => s.activeCall);
  const favorites = useDirectoryStore((s) => s.favorites);
  const toggleFavorite = useDirectoryStore((s) => s.toggleFavorite);

  const results = searchContacts(CONTACTS, q);
  const favContacts = CONTACTS.filter((c) => favorites.includes(c.e164));

  return (
    <Card>
      <div className="relative mb-3">
        <MagnifyingGlass size={16} aria-hidden className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("phone.directory.search")}
          aria-label={t("phone.directory.search")}
          className="h-11 w-full rounded-md border border-border bg-bg pl-8 pr-3 text-base text-fg outline-none placeholder:text-muted"
        />
      </div>

      {favContacts.length > 0 && !q ? (
        <div className="mb-3">
          <h4 className="mb-1 text-base font-semibold text-muted">{t("phone.directory.favorites")}</h4>
          <div className="flex flex-wrap gap-2">
            {favContacts.map((c) => (
              <button
                key={c.id}
                disabled={!!active}
                onClick={() => place(c.e164)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-base text-fg hover:bg-surface disabled:opacity-50"
              >
                <PhoneCall size={14} aria-hidden /> {c.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <ul className="divide-y divide-border">
        {results.map((c) => {
          const fav = favorites.includes(c.e164);
          return (
            <li key={c.id} className="flex items-center gap-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-base text-fg">{c.name}</div>
                <div className="truncate text-base text-muted">{formatNumber(c.e164)}</div>
              </div>
              <IconButton
                label={t("phone.directory.favorite")}
                variant={fav ? "primary" : "ghost"}
                onClick={() => toggleFavorite(c.e164)}
              >
                <Star size={18} weight={fav ? "fill" : "regular"} aria-hidden />
              </IconButton>
              <IconButton label={t("phone.call")} disabled={!!active} onClick={() => place(c.e164)}>
                <PhoneCall size={18} aria-hidden />
              </IconButton>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
