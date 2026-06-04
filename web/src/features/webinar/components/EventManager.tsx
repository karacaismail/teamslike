import * as React from "react";
import { useTranslation } from "react-i18next";
import { Ticket, CalendarBlank, IdentificationCard, Plus, Trash, Printer, Warning } from "@/lib/icons";
import { useEventsStore } from "../eventsStore";
import { agendaByDay, agendaConflicts, formatPrice, isSoldOut, ticketRevenue, ticketsRemaining } from "../events";
import { EVENTS, REGISTRATIONS } from "../data";
import { Badge, Button, Card, IconButton } from "@/components/ui/primitives";

const CURRENCIES = ["USD", "EUR", "TRY", "GBP"];
const BADGE_FIELDS = ["name", "email", "company", "role"];

const fieldLabel = (id: string) =>
  EVENTS[0].registrationFields.find((f) => f.id === id)?.label ?? id;

export function EventManager() {
  const { t } = useTranslation();
  const tiers = useEventsStore((s) => s.tiers);
  const agenda = useEventsStore((s) => s.agenda);
  const badge = useEventsStore((s) => s.badge);
  const printQueue = useEventsStore((s) => s.printQueue);
  const addTier = useEventsStore((s) => s.addTier);
  const removeTier = useEventsStore((s) => s.removeTier);
  const sellTicket = useEventsStore((s) => s.sellTicket);
  const addAgendaItem = useEventsStore((s) => s.addAgendaItem);
  const removeAgendaItem = useEventsStore((s) => s.removeAgendaItem);
  const toggleBadgeField = useEventsStore((s) => s.toggleBadgeField);
  const queueBadges = useEventsStore((s) => s.queueBadges);
  const clearQueue = useEventsStore((s) => s.clearQueue);

  const revenue = ticketRevenue(tiers);
  const days = agendaByDay(agenda);
  const conflicts = agendaConflicts(agenda);
  const sample = REGISTRATIONS.find((r) => r.eventId === "ev_launch")!;
  const confirmedIds = REGISTRATIONS.filter((r) => r.eventId === "ev_launch").map((r) => r.id);

  // Ticket form
  const [tName, setTName] = React.useState("");
  const [tCurrency, setTCurrency] = React.useState("USD");
  const [tPrice, setTPrice] = React.useState(0);
  const [tQty, setTQty] = React.useState(100);
  // Agenda form
  const [aDay, setADay] = React.useState("Day 1");
  const [aTrack, setATrack] = React.useState("Main stage");
  const [aStart, setAStart] = React.useState("11:00");
  const [aEnd, setAEnd] = React.useState("11:30");
  const [aTitle, setATitle] = React.useState("");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Ticketing */}
      <Card className="lg:col-span-2">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Ticket size={20} className="text-accent" aria-hidden />
          <h2 className="text-lg font-semibold text-fg">{t("webinar.events.tickets")}</h2>
          <div className="ml-auto flex flex-wrap gap-1">
            {Object.entries(revenue).map(([cur, amt]) => (
              <Badge key={cur} tone="positive">
                {formatPrice(amt, cur)}
              </Badge>
            ))}
          </div>
        </div>
        <table className="w-full border-collapse text-base">
          <thead>
            <tr className="text-left text-muted">
              <th className="border-b border-border px-2 py-1 font-semibold">{t("webinar.events.tier")}</th>
              <th className="border-b border-border px-2 py-1 font-semibold">{t("webinar.events.price")}</th>
              <th className="border-b border-border px-2 py-1 font-semibold">{t("webinar.events.sold")}</th>
              <th className="border-b border-border px-2 py-1 font-semibold">{t("webinar.events.remaining")}</th>
              <th className="border-b border-border px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => (
              <tr key={tier.id}>
                <td className="border-b border-border px-2 py-1 text-fg">{tier.name}</td>
                <td className="border-b border-border px-2 py-1 text-fg">
                  {tier.price === 0 ? t("webinar.events.free") : formatPrice(tier.price, tier.currency)}
                </td>
                <td className="border-b border-border px-2 py-1 text-fg">
                  {tier.sold}/{tier.quantity}
                </td>
                <td className="border-b border-border px-2 py-1">
                  {isSoldOut(tier) ? (
                    <Badge tone="danger">{t("webinar.events.soldOut")}</Badge>
                  ) : (
                    <span className="text-fg">{ticketsRemaining(tier)}</span>
                  )}
                </td>
                <td className="border-b border-border px-2 py-1 text-right">
                  <span className="inline-flex gap-1">
                    <Button variant="secondary" onClick={() => sellTicket(tier.id)} disabled={isSoldOut(tier)}>
                      {t("webinar.events.sell")}
                    </Button>
                    <IconButton label={t("common.delete")} variant="ghost" onClick={() => removeTier(tier.id)}>
                      <Trash size={18} aria-hidden />
                    </IconButton>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <input
            value={tName}
            onChange={(e) => setTName(e.target.value)}
            placeholder={t("webinar.events.tierNamePh")}
            aria-label={t("webinar.events.tierNamePh")}
            className="h-11 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <select value={tCurrency} onChange={(e) => setTCurrency(e.target.value)} aria-label={t("webinar.events.currency")} className="h-11 rounded-md border border-border bg-surface px-2 text-base text-fg">
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input type="number" min={0} value={tPrice} onChange={(e) => setTPrice(Number(e.target.value))} aria-label={t("webinar.events.price")} className="h-11 w-24 rounded-md border border-border bg-surface px-2 text-base text-fg" />
          <input type="number" min={1} value={tQty} onChange={(e) => setTQty(Number(e.target.value))} aria-label={t("webinar.events.quantity")} className="h-11 w-24 rounded-md border border-border bg-surface px-2 text-base text-fg" />
          <Button
            onClick={() => {
              if (!tName.trim()) return;
              addTier({ name: tName.trim(), currency: tCurrency, price: tPrice, quantity: tQty });
              setTName("");
            }}
          >
            <Plus size={18} aria-hidden /> {t("webinar.events.addTier")}
          </Button>
        </div>
      </Card>

      {/* Agenda */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <CalendarBlank size={20} className="text-accent" aria-hidden />
          <h2 className="text-lg font-semibold text-fg">{t("webinar.events.agenda")}</h2>
          {conflicts.length > 0 ? (
            <Badge tone="warning" className="ml-auto">
              <Warning size={14} aria-hidden /> {t("webinar.events.conflicts", { n: conflicts.length })}
            </Badge>
          ) : null}
        </div>
        {days.map((d) => (
          <div key={d.day} className="mb-3">
            <h3 className="mb-1 text-base font-semibold text-fg">{d.day}</h3>
            <ul className="space-y-1">
              {d.items.map((item) => (
                <li key={item.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base">
                  <span className="tabular-nums text-muted">{item.start}–{item.end}</span>
                  <span className="font-medium text-fg">{item.title}</span>
                  <span className="text-muted">· {item.track}{item.speaker ? ` · ${item.speaker}` : ""}</span>
                  <IconButton label={t("common.delete")} variant="ghost" className="ml-auto" onClick={() => removeAgendaItem(item.id)}>
                    <Trash size={18} aria-hidden />
                  </IconButton>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex flex-wrap items-end gap-2">
          <input value={aDay} onChange={(e) => setADay(e.target.value)} aria-label={t("webinar.events.day")} className="h-11 w-24 rounded-md border border-border bg-surface px-2 text-base text-fg" />
          <input value={aTrack} onChange={(e) => setATrack(e.target.value)} aria-label={t("webinar.events.track")} className="h-11 w-32 rounded-md border border-border bg-surface px-2 text-base text-fg" />
          <input value={aStart} onChange={(e) => setAStart(e.target.value)} aria-label={t("webinar.events.start")} className="h-11 w-20 rounded-md border border-border bg-surface px-2 text-base text-fg" />
          <input value={aEnd} onChange={(e) => setAEnd(e.target.value)} aria-label={t("webinar.events.end")} className="h-11 w-20 rounded-md border border-border bg-surface px-2 text-base text-fg" />
          <input value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder={t("webinar.events.sessionPh")} aria-label={t("webinar.events.sessionPh")} className="h-11 flex-1 rounded-md border border-border bg-surface px-2 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent" />
          <Button
            onClick={() => {
              if (!aTitle.trim()) return;
              addAgendaItem({ day: aDay, track: aTrack, start: aStart, end: aEnd, title: aTitle.trim() });
              setATitle("");
            }}
          >
            <Plus size={18} aria-hidden /> {t("webinar.events.addSession")}
          </Button>
        </div>
      </Card>

      {/* Badges */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <IdentificationCard size={20} className="text-accent" aria-hidden />
          <h2 className="text-lg font-semibold text-fg">{t("webinar.events.badges")}</h2>
        </div>

        {/* Preview */}
        <div className="mb-3 rounded-lg border-l-4 border border-border p-3" style={{ borderLeftColor: badge.accent }}>
          <div className="text-base text-muted">{t("webinar.events.badgePreview")}</div>
          {badge.fields.map((f) => (
            <div key={f} className={f === "name" ? "text-xl font-bold text-fg" : "text-base text-fg"}>
              {sample.values[f] ?? `—`}
            </div>
          ))}
        </div>

        <fieldset className="mb-3">
          <legend className="mb-1 text-base font-medium text-fg">{t("webinar.events.badgeFields")}</legend>
          <div className="flex flex-wrap gap-3">
            {BADGE_FIELDS.map((f) => (
              <label key={f} className="inline-flex items-center gap-2 text-base text-fg">
                <input type="checkbox" checked={badge.fields.includes(f)} onChange={() => toggleBadgeField(f)} className="h-4 w-4 accent-accent" />
                {fieldLabel(f)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-2">
          <Button onClick={() => queueBadges(confirmedIds)}>
            <Printer size={18} aria-hidden /> {t("webinar.events.printConfirmed")}
          </Button>
          <Badge tone="accent">{t("webinar.events.queued", { n: printQueue.length })}</Badge>
          {printQueue.length > 0 ? (
            <Button variant="ghost" onClick={clearQueue}>
              {t("webinar.events.clearQueue")}
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
