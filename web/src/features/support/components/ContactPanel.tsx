import * as React from "react";
import { useTranslation } from "react-i18next";
import { Star, EnvelopeSimple, Phone, At, Tag, Plus, X } from "@/lib/icons";
import { useConversationStore } from "../conversationStore";
import { csatAverage } from "../support";
import { CONTACTS } from "../data";
import { Badge, Card, IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { KbPanel } from "./KbPanel";

export function ContactPanel() {
  const { t } = useTranslation();
  const conversations = useConversationStore((s) => s.conversations);
  const conv = useConversationStore((s) => s.conversations.find((c) => c.id === s.activeConversationId) ?? null);
  const submitCsat = useConversationStore((s) => s.submitCsat);
  const addLabel = useConversationStore((s) => s.addLabel);
  const removeLabel = useConversationStore((s) => s.removeLabel);
  const [label, setLabel] = React.useState("");
  const teamCsat = csatAverage(conversations);
  if (!conv) return null;
  const submitLabel = () => {
    const v = label.trim();
    if (!v) return;
    addLabel(conv.id, v);
    setLabel("");
  };
  const contact = CONTACTS.find((c) => c.id === conv.contactId);
  if (!contact) return null;

  return (
    <div className="hidden w-72 shrink-0 space-y-3 overflow-y-auto border-l border-border bg-raised p-3 xl:block">
      <Card className="p-3">
        <h3 className="mb-2 text-base font-semibold text-fg">{contact.name}</h3>
        <ul className="space-y-1 text-base text-muted">
          {contact.identifiers.email ? <li className="flex items-center gap-2"><EnvelopeSimple size={14} aria-hidden /> {contact.identifiers.email}</li> : null}
          {contact.identifiers.phone ? <li className="flex items-center gap-2"><Phone size={14} aria-hidden /> {contact.identifiers.phone}</li> : null}
          {contact.identifiers.social ? <li className="flex items-center gap-2"><At size={14} aria-hidden /> {contact.identifiers.social}</li> : null}
        </ul>
      </Card>

      <Card className="p-3">
        <h3 className="mb-2 text-base font-semibold text-fg">{t("support.attributes")}</h3>
        <dl className="space-y-1 text-base">
          {Object.entries(contact.attributes).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <dt className="text-muted">{k}</dt>
              <dd className="text-fg">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="p-3">
        <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
          <Tag size={16} aria-hidden /> {t("support.labels")}
        </h3>
        <div className="mb-2 flex flex-wrap gap-1">
          {conv.labels.length === 0 ? <span className="text-base text-muted">{t("support.noLabels")}</span> : null}
          {conv.labels.map((l) => (
            <span key={l} className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-base text-fg">
              {l}
              <button onClick={() => removeLabel(conv.id, l)} aria-label={t("support.removeLabel", { label: l })} className="text-muted hover:text-danger">
                <X size={12} aria-hidden />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submitLabel(); }}
            placeholder={t("support.addLabel")}
            aria-label={t("support.addLabel")}
            className="h-9 flex-1 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none placeholder:text-muted"
          />
          <IconButton label={t("support.addLabel")} onClick={submitLabel}>
            <Plus size={16} aria-hidden />
          </IconButton>
        </div>
      </Card>

      <Card className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold text-fg">{t("support.csat")}</h3>
          {teamCsat > 0 ? <Badge tone="accent">{t("support.csatAvg", { n: teamCsat.toFixed(1) })}</Badge> : null}
        </div>
        <div className="flex items-center gap-1" role="group" aria-label={t("support.csat")}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => submitCsat(conv.id, n)} aria-label={t("support.csatRate", { n })}>
              <Star size={20} weight={(conv.csat ?? 0) >= n ? "fill" : "regular"} className={cn((conv.csat ?? 0) >= n ? "text-warning" : "text-muted")} aria-hidden />
            </button>
          ))}
        </div>
      </Card>

      <KbPanel />
    </div>
  );
}
