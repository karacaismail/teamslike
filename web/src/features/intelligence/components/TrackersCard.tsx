import { useTranslation } from "react-i18next";
import { MagnifyingGlass, Flag, Tag } from "@/lib/icons";
import { useIntelStore } from "../store";
import { TRACKERS } from "../data";
import { Card, Badge } from "@/components/ui/primitives";
import type { IconType } from "@/types/domain";
import type { Tracker } from "../types";

const KIND: Record<Tracker["kind"], IconType> = {
  keyword: MagnifyingGlass,
  competitor: Flag,
  topic: Tag,
};

/** Custom Moments / trackers — keyword, competitor and topic mentions (Dialpad). */
export function TrackersCard() {
  const { t } = useTranslation();
  const id = useIntelStore((s) => s.activeSourceId);
  const trackers = TRACKERS[id] ?? [];
  if (trackers.length === 0) return null;

  return (
    <Card>
      <h3 className="mb-2 text-base font-semibold text-fg">{t("intel.trackers")}</h3>
      <ul className="space-y-1.5">
        {trackers.map((tr) => {
          const Icon = KIND[tr.kind];
          return (
            <li key={tr.id} className="flex items-center gap-2 text-base">
              <Icon size={16} className="text-muted" aria-hidden />
              <span className="flex-1 text-fg">{tr.label}</span>
              <Badge tone={tr.kind === "competitor" ? "danger" : "neutral"}>
                {t("intel.hits", { n: tr.hits })}
              </Badge>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
