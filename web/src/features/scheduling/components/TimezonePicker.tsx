import { useTranslation } from "react-i18next";
import { GlobeHemisphereWest } from "@/lib/icons";

const ZONES = ["Europe/Istanbul", "Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Tokyo", "UTC"];

export function TimezonePicker({ value, onChange }: { value: string; onChange: (z: string) => void }) {
  const { t } = useTranslation();
  const zones = ZONES.includes(value) ? ZONES : [value, ...ZONES];
  return (
    <label className="flex items-center gap-2 text-base text-muted">
      <GlobeHemisphereWest size={16} aria-hidden /> {t("scheduling.timezone")}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-md border border-border bg-bg px-2 text-base text-fg"
      >
        {zones.map((z) => (
          <option key={z} value={z}>{z}</option>
        ))}
      </select>
    </label>
  );
}
