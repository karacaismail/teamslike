import type { CallerClass, Contact, Presence, RoutingActionKind, RoutingRule } from "./types";

/**
 * Pure Telephony-domain helpers. Framework-free so they unit-test without
 * stores/React — these encode the carrier-agnostic dialing & routing rules.
 */

/** DTMF / number normalization to a dialable E.164-ish string. */
export function normalizeNumber(input: string): string {
  const s = input.trim();
  let plus = s.startsWith("+");
  let digits = s.replace(/\D/g, "");
  // International "00" prefix → "+".
  if (!plus && digits.startsWith("00")) {
    plus = true;
    digits = digits.slice(2);
  }
  return (plus ? "+" : "") + digits;
}

/** Display formatting — national grouping for +1 numbers, untouched otherwise. */
export function formatNumber(e164: string): string {
  if (/^\+1\d{10}$/.test(e164)) {
    const d = e164.slice(2);
    return `+1 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return e164;
}

export interface RoutingContext {
  afterHours?: boolean;
  busy?: boolean;
  noAnswer?: boolean;
}

/**
 * Find-me/follow-me evaluation: the most specific matching condition wins; the
 * `always` rule is the catch-all. Order-independent (conditionals beat always).
 */
export function evaluateRouting(rules: RoutingRule[], ctx: RoutingContext): RoutingRule | null {
  const matches = (r: RoutingRule): boolean =>
    r.condition === "afterHours"
      ? !!ctx.afterHours
      : r.condition === "busy"
        ? !!ctx.busy
        : r.condition === "noAnswer"
          ? !!ctx.noAnswer
          : false;
  return rules.find(matches) ?? rules.find((r) => r.condition === "always") ?? null;
}

/** Presence → default routing action (online connects; otherwise voicemail). */
export function presenceToRouting(presence: Presence): RoutingActionKind {
  return presence === "online" ? "forward" : "voicemail";
}

/** Resolve a number to a contact name, else its formatted form (caller-ID). */
export function callerName(e164: string, contacts: Contact[]): string {
  return contacts.find((c) => c.e164 === e164)?.name ?? formatNumber(e164);
}

/** Caller reputation: blocked → trusted (known) → spam (heuristic) → unknown. */
export function classifyCaller(
  e164: string,
  opts: { contacts: Contact[]; blocklist: string[] },
): CallerClass {
  if (opts.blocklist.includes(e164)) return "blocked";
  if (opts.contacts.some((c) => c.e164 === e164)) return "trusted";
  const digits = e164.replace(/\D/g, "");
  if (digits.length < 7) return "spam"; // short codes / invalid
  if (/(\d)\1{4,}/.test(digits)) return "spam"; // 5+ identical run (robocall pattern)
  return "unknown";
}

/** Case-insensitive directory search over name + number. */
export function searchContacts(contacts: Contact[], q: string): Contact[] {
  const s = q.trim().toLowerCase();
  if (!s) return contacts;
  return contacts.filter((c) => c.name.toLowerCase().includes(s) || c.e164.toLowerCase().includes(s));
}

/** Substitute {{variable}} placeholders; unknown placeholders are left intact. */
export function renderTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in vars ? vars[key] : m));
}
