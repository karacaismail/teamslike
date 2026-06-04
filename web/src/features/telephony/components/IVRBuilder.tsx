import * as React from "react";
import { useTranslation } from "react-i18next";
import { Plus, TreeStructure } from "@/lib/icons";
import { usePbxStore } from "../pbxStore";
import { Badge, Button, Card } from "@/components/ui/primitives";
import type { IVRMenu, IVROption, IVROptionAction } from "../types";

const ACTIONS: IVROptionAction[] = ["menu", "queue", "voicemail", "forward", "extension"];

export function IVRBuilder() {
  const { t } = useTranslation();
  const storeMenus = usePbxStore((s) => s.menus);
  const [menus, setMenus] = React.useState<IVRMenu[]>(() => storeMenus.map((m) => ({ ...m, options: [...m.options] })));
  const [menuId, setMenuId] = React.useState(storeMenus[0]?.id ?? "");
  const [key, setKey] = React.useState("4");
  const [label, setLabel] = React.useState("");
  const [action, setAction] = React.useState<IVROptionAction>("queue");
  const [target, setTarget] = React.useState("");

  const addOption = () => {
    const opt: IVROption = { key, label: label || t(`phone.ivr.action.${action}`), action, target: target || undefined };
    setMenus((ms) => ms.map((m) => (m.id === menuId ? { ...m, options: [...m.options, opt] } : m)));
    setLabel("");
    setTarget("");
  };

  return (
    <div className="space-y-4">
      {menus.map((m) => (
        <Card key={m.id}>
          <div className="mb-1 flex items-center gap-2">
            <TreeStructure size={18} className="text-muted" aria-hidden />
            <span className="text-base font-semibold text-fg">{m.name}</span>
            <span className="text-base text-muted">· {m.id}</span>
          </div>
          <p className="mb-2 text-base text-muted">{m.greeting}</p>
          <ul className="space-y-1">
            {m.options.map((o) => (
              <li key={o.key} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-base">
                <kbd className="rounded-sm border border-border bg-surface px-1.5 text-fg">{o.key}</kbd>
                <span className="flex-1 text-fg">{o.label}</span>
                <Badge tone="accent">{t(`phone.ivr.action.${o.action}`)}</Badge>
                {o.target ? <span className="text-muted">{o.target}</span> : null}
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <Card>
        <h3 className="mb-3 text-base font-semibold text-fg">{t("phone.ivr.addOption")}</h3>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-base text-muted">
            {t("phone.ivr.menu")}
            <select value={menuId} onChange={(e) => setMenuId(e.target.value)} className="h-11 rounded-md border border-border bg-bg px-2 text-base text-fg">
              {menus.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-base text-muted">
            {t("phone.ivr.key")}
            <select value={key} onChange={(e) => setKey(e.target.value)} className="h-11 w-16 rounded-md border border-border bg-bg px-2 text-base text-fg">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "*", "#"].map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-base text-muted">
            {t("phone.ivr.label")}
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="h-11 w-32 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-base text-muted">
            {t("phone.ivr.then")}
            <select value={action} onChange={(e) => setAction(e.target.value as IVROptionAction)} className="h-11 rounded-md border border-border bg-bg px-2 text-base text-fg">
              {ACTIONS.map((a) => <option key={a} value={a}>{t(`phone.ivr.action.${a}`)}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-base text-muted">
            {t("phone.ivr.target")}
            <input value={target} onChange={(e) => setTarget(e.target.value)} className="h-11 w-32 rounded-md border border-border bg-bg px-2 text-base text-fg outline-none" />
          </label>
          <Button onClick={addOption}>
            <Plus size={16} aria-hidden /> {t("phone.ivr.addOption")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
