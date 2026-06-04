import { useTranslation } from "react-i18next";
import { Broadcast, FilmSlate, UserCircle } from "@/lib/icons";
import { useEventStore } from "../eventStore";
import { useToastStore } from "@/store/toastStore";
import { PANELISTS } from "../data";
import { Badge, Button, Card } from "@/components/ui/primitives";

export function Backstage() {
  const { t } = useTranslation();
  const mode = useEventStore((s) => s.mode);
  const goLive = useEventStore((s) => s.goLive);
  const push = useToastStore((s) => s.push);

  const roleTone = { host: "accent", panelist: "neutral", moderator: "positive" } as const;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-2 text-base font-semibold text-fg">{t("webinar.panelists")}</h3>
        <ul className="space-y-1.5">
          {PANELISTS.map((p) => (
            <li key={p.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-base">
              <UserCircle size={20} className="text-muted" aria-hidden />
              <span className="flex-1 text-fg">{p.name}</span>
              <Badge tone={roleTone[p.role]}>{t(`webinar.role.${p.role}`)}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="mb-2 text-base font-semibold text-fg">{t("webinar.broadcast")}</h3>
        <p className="mb-3 text-base text-muted">{t("webinar.broadcastHint")}</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={goLive}>
            <Broadcast size={18} aria-hidden /> {t("webinar.goLive")}
          </Button>
          {mode === "simulive" || mode === "evergreen" ? (
            <Button variant="secondary" onClick={() => push({ title: t("webinar.simuliveStarted"), tone: "positive" })}>
              <FilmSlate size={18} aria-hidden /> {t("webinar.startSimulive")}
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
