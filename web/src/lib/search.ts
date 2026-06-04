import { DOMAINS } from "@/data/domains";
import { TEAM } from "@/data/team";

/**
 * Global search open-host service (A2). Aggregates across the platform and
 * returns deep-linkable results (reusing the J2/J3 URL targets). Domains add
 * richer results via `registerSearchProvider` (inversion of control), so this
 * service never imports feature internals — keeping the dependency direction
 * correct and the boundary checker green.
 */
export type SearchResultKind = "member" | "domain" | string;

export interface SearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle?: string;
  /** i18n key for domain titles, resolved by the caller. */
  labelKey?: string;
  /** Deep-link target. */
  href: string;
}

type Provider = (q: string) => SearchResult[];
const providers: Provider[] = [];

export function registerSearchProvider(p: Provider): void {
  providers.push(p);
}

export function searchAll(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: SearchResult[] = [];

  for (const m of TEAM) {
    if (
      m.name.toLowerCase().includes(q) ||
      (m.title ?? "").toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    ) {
      out.push({ id: m.id, kind: "member", title: m.name, subtitle: m.title, href: "/members" });
    }
  }
  for (const d of DOMAINS) {
    if (d.key.toLowerCase().includes(q)) {
      out.push({ id: d.key, kind: "domain", title: d.key, labelKey: d.labelKey, href: d.path });
    }
  }
  for (const p of providers) out.push(...p(q));
  return out.slice(0, 24);
}
