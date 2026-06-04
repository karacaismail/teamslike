import type { TFunction } from "i18next";

/** Relative time label from minutes-ago (i18n). */
export function relTime(t: TFunction, minutes: number): string {
  if (minutes < 1) return t("time.now");
  if (minutes < 60) return t("time.minutesAgo", { n: minutes });
  return t("time.hoursAgo", { n: Math.round(minutes / 60) });
}
