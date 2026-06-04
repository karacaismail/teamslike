import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMessagingStore } from "../store";
import { CHANNELS } from "../data";

/** Simulated presence/typing indicator (WhatsApp/Telegram). */
export function TypingIndicator() {
  const { t } = useTranslation();
  const channelId = useMessagingStore((s) => s.activeChannelId);
  const [typing, setTyping] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTyping(null);
    const ch = CHANNELS.find((c) => c.id === channelId);
    const who = ch?.kind === "dm" ? ch.name : "Defne Yıldız";
    const show = setTimeout(() => setTyping(who), 1600);
    const hide = setTimeout(() => setTyping(null), 5200);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [channelId]);

  if (!typing) return null;
  return (
    <div className="px-4 py-1 text-base text-muted" aria-live="polite">
      {t("messaging.typing", { name: typing })}
    </div>
  );
}
