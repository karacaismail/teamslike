import * as React from "react";
import { useTranslation } from "react-i18next";
import { ChatCircle, MagnifyingGlass } from "@/lib/icons";
import { EmptyState, Skeleton } from "@/components/ui/primitives";
import { useFirstLoad } from "@/lib/useFirstLoad";

/** Loading placeholder matching the real (flat, Slack-style) message rows:
 *  an author line above one or two body text lines — not bubbles, so it lines
 *  up with what actually renders (ui.md A5). */
function MessageListSkeleton({ label }: { label: string }) {
  const rows = [["w-2/3", "w-1/2"], ["w-3/4"], ["w-1/2", "w-2/5"], ["w-3/5"], ["w-2/3"], ["w-1/2", "w-1/3"]];
  return (
    <div className="flex-1 space-y-5 overflow-hidden p-4" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {rows.map((lines, i) => (
        <div key={i} className="space-y-1.5" aria-hidden>
          <Skeleton className="h-3.5 w-28" />
          {lines.map((w, j) => (
            <Skeleton key={j} className={`h-3.5 ${w}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
import { useMessagingStore } from "../store";
import { UNREAD_FROM } from "../data";
import { MessageBubble } from "./MessageBubble";

export function MessageList() {
  const { t } = useTranslation();
  const { messages, channels, activeChannelId, activeTopicId, search, savedOnly } =
    useMessagingStore();
  const endRef = React.useRef<HTMLDivElement>(null);
  const firstLoad = useFirstLoad();

  const channel = channels.find((c) => c.id === activeChannelId);
  const bubble = channel?.kind === "dm";
  const q = search.trim().toLowerCase();

  const topLevel = messages
    .filter(
      (m) =>
        m.topicId === activeTopicId &&
        m.parentId === null &&
        !m.scheduled &&
        !m.hiddenForMe,
    )
    .filter((m) => !savedOnly || m.saved)
    .filter((m) => q === "" || m.body.toLowerCase().includes(q))
    .slice()
    .sort((a, b) => b.tMinutes - a.tMinutes);

  const repliesCount = (id: string) =>
    messages.filter((m) => m.parentId === id).length;

  const unreadFromId = UNREAD_FROM[activeTopicId];

  React.useEffect(() => {
    const el = endRef.current;
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "end" });
  }, [messages, activeTopicId]);

  if (firstLoad) {
    return <MessageListSkeleton label={t("common.loading")} />;
  }

  if (topLevel.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        {q ? (
          <EmptyState
            icon={<MagnifyingGlass size={28} aria-hidden />}
            title={t("messaging.noResults")}
            hint={t("messaging.noResultsHint")}
          />
        ) : (
          <EmptyState
            icon={<ChatCircle size={28} aria-hidden />}
            title={t("messaging.empty")}
            hint={t("messaging.emptyHint")}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-3">
      {topLevel.map((m, i) => {
        const prev = topLevel[i - 1];
        const grouped =
          !bubble &&
          !!prev &&
          prev.authorId === m.authorId &&
          Math.abs(prev.tMinutes - m.tMinutes) < 8;
        return (
          <React.Fragment key={m.id}>
            {unreadFromId === m.id ? (
              <div className="my-2 flex items-center gap-2 px-4" role="separator">
                <span className="h-px flex-1 bg-danger" />
                <span className="text-base font-medium text-danger">
                  {t("messaging.newMessages")}
                </span>
                <span className="h-px flex-1 bg-danger" />
              </div>
            ) : null}
            <MessageBubble
              message={m}
              grouped={grouped}
              repliesCount={repliesCount(m.id)}
              bubble={bubble}
            />
          </React.Fragment>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
