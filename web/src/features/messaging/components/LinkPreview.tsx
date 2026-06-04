import { useTranslation } from "react-i18next";
import { LinkSimple } from "@/lib/icons";

export function firstUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s)]+/);
  return m ? m[0] : null;
}

/** Mock link unfurl / preview card (Slack/Teams/Telegram). */
export function LinkPreview({ url }: { url: string }) {
  const { t } = useTranslation();
  let host = url;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* ignore */
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 block max-w-md overflow-hidden rounded-md border border-border hover:border-accent"
    >
      <div className="h-20 bg-gradient-to-br from-accent/30 to-surface" aria-hidden />
      <div className="p-2">
        <div className="flex items-center gap-1 text-base font-medium text-fg">
          <LinkSimple size={14} aria-hidden /> {host}
        </div>
        <div className="text-base text-muted">{t("messaging.linkPreview")}</div>
      </div>
    </a>
  );
}
