import { Check, Checks, ClockCountdown } from "@/lib/icons";
import { useTranslation } from "react-i18next";
import type { DeliveryStatus } from "../types";

/** WhatsApp-style delivery indicator (icon + accessible label). */
export function DeliveryTicks({ status }: { status?: DeliveryStatus }) {
  const { t } = useTranslation();
  if (!status) return null;
  if (status === "sending")
    return <ClockCountdown size={14} className="text-muted" aria-label={t("messaging.deliverySending")} />;
  if (status === "sent")
    return <Check size={14} className="text-muted" aria-label={t("messaging.deliverySent")} />;
  if (status === "delivered")
    return <Checks size={14} className="text-muted" aria-label={t("messaging.deliveryDelivered")} />;
  return <Checks size={14} className="text-accent" aria-label={t("messaging.deliveryRead")} />;
}
