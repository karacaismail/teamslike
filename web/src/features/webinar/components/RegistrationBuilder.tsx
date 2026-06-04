import * as React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash } from "@/lib/icons";
import { useEventStore } from "../eventStore";
import { useToastStore } from "@/store/toastStore";
import { validateRegistration } from "../webinar";
import { CapacityPanel } from "./CapacityPanel";
import { Badge, Button, Card, IconButton } from "@/components/ui/primitives";
import type { RegField, RegFieldType } from "../types";

const TYPES: RegFieldType[] = ["text", "email", "select"];

export function RegistrationBuilder() {
  const { t } = useTranslation();
  const event = useEventStore((s) => s.events.find((e) => e.id === s.activeEventId)!);
  const register = useEventStore((s) => s.register);
  const push = useToastStore((s) => s.push);

  const [fields, setFields] = React.useState<RegField[]>(() => [...event.registrationFields]);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [label, setLabel] = React.useState("");
  const [type, setType] = React.useState<RegFieldType>("text");
  const [required, setRequired] = React.useState(true);

  const addField = () => {
    if (!label.trim()) return;
    setFields((f) => [...f, { id: `f_${Date.now()}`, label: label.trim(), required, type }]);
    setLabel("");
  };
  const submit = () => {
    const res = validateRegistration(fields, values);
    setErrors(res.errors);
    if (res.ok) {
      register(values);
      push({ title: t("webinar.registered"), tone: "positive" });
      setValues({});
    }
  };

  return (
    <div className="space-y-4">
      <CapacityPanel />
      <div className="grid gap-4 lg:grid-cols-2">
      {/* Field builder */}
      <Card>
        <h3 className="mb-2 text-base font-semibold text-fg">{t("webinar.regFields")}</h3>
        <ul className="mb-3 space-y-1.5">
          {fields.map((f) => (
            <li key={f.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base">
              <span className="flex-1 text-fg">{f.label}</span>
              <Badge tone="neutral">{t(`webinar.fieldType.${f.type}`)}</Badge>
              {f.required ? <Badge tone="accent">{t("webinar.required")}</Badge> : null}
              <IconButton label={t("webinar.removeField")} onClick={() => setFields((x) => x.filter((y) => y.id !== f.id))}>
                <Trash size={16} aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
          <label className="flex flex-1 flex-col gap-1 text-base text-muted">
            {t("webinar.fieldLabel")}
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="h-11 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-base text-muted">
            {t("webinar.fieldTypeLabel")}
            <select value={type} onChange={(e) => setType(e.target.value as RegFieldType)} className="h-11 rounded-md border border-border bg-bg px-2 text-base text-fg">
              {TYPES.map((ty) => <option key={ty} value={ty}>{t(`webinar.fieldType.${ty}`)}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-base text-fg">
            <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} className="h-4 w-4" />
            {t("webinar.required")}
          </label>
          <Button onClick={addField}><Plus size={16} aria-hidden /> {t("webinar.addField")}</Button>
        </div>
      </Card>

      {/* Live form preview */}
      <Card>
        <h3 className="mb-2 text-base font-semibold text-fg">{t("webinar.formPreview")}</h3>
        <div className="space-y-2">
          {fields.map((f) => (
            <label key={f.id} className="block">
              <span className="text-base text-fg">
                {f.label}{f.required ? <span className="text-danger"> *</span> : null}
              </span>
              {f.type === "select" ? (
                <select
                  value={values[f.id] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-2 text-base text-fg"
                >
                  <option value="">—</option>
                  {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  value={values[f.id] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-2 text-base text-fg outline-none"
                />
              )}
              {errors[f.id] ? <span className="text-base text-danger">{t(`webinar.regError.${errors[f.id]}`)}</span> : null}
            </label>
          ))}
          <Button className="w-full" onClick={submit}>{t("webinar.register")}</Button>
        </div>
      </Card>
      </div>
    </div>
  );
}
