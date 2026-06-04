import { useTranslation } from "react-i18next";
import { SquaresFour } from "@/lib/icons";
import { useCommunitiesStore } from "../communitiesStore";
import { useMessagingStore } from "../store";
import { communityChannels } from "../chat";
import { cn } from "@/lib/cn";
import type { Community } from "../types";

/** Community rail (group-of-groups). Selecting one jumps to its first channel. */
export function CommunitiesBar() {
  const { t } = useTranslation();
  const communities = useCommunitiesStore((s) => s.communities);
  const activeId = useCommunitiesStore((s) => s.activeCommunityId);
  const setActive = useCommunitiesStore((s) => s.setActiveCommunity);
  const channels = useMessagingStore((s) => s.channels);
  const setChannel = useMessagingStore((s) => s.setChannel);

  const pick = (c: Community) => {
    setActive(c.id);
    const first = communityChannels(c, channels)[0];
    if (first) setChannel(first.id);
  };

  return (
    <nav aria-label={t("messaging.communities")} className="flex w-14 shrink-0 flex-col items-center gap-2 border-r border-border bg-raised py-2">
      <button
        onClick={() => setActive(null)}
        aria-label={t("messaging.allCommunities")}
        aria-current={activeId === null}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          activeId === null ? "bg-accent text-accent-fg" : "bg-surface text-muted hover:bg-bg",
        )}
      >
        <SquaresFour size={20} aria-hidden />
      </button>
      {communities.map((c) => (
        <button
          key={c.id}
          onClick={() => pick(c)}
          aria-label={c.name}
          aria-current={activeId === c.id}
          title={c.name}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl text-base font-semibold uppercase",
            activeId === c.id ? "bg-accent text-accent-fg" : "bg-surface text-fg hover:bg-bg",
          )}
        >
          {c.name.slice(0, 2)}
        </button>
      ))}
    </nav>
  );
}
