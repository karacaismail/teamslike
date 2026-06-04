import * as React from "react";
import { useTranslation } from "react-i18next";
import { VideoCamera, Eye, Record, MagnifyingGlass, Sparkle, Archive } from "@/lib/icons";
import { useDocsStore } from "../docsStore";
import { useAuthStore } from "@/store/authStore";
import { MEMBER_NAMES } from "../data";
import { Badge, Button, Card, EmptyState, Skeleton } from "@/components/ui/primitives";
import { useFirstLoad } from "@/lib/useFirstLoad";
import { cn } from "@/lib/cn";
import { ClipDetail } from "./ClipDetail";

/** Loading placeholder matching the clips two-pane layout: thumbnail rows on
 *  the left, a large video-preview block on the right. */
function ClipsSkeleton({ label }: { label: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_1fr]" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <Card>
        <ul className="space-y-2" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center gap-2 rounded-md border border-border p-2">
              <Skeleton className="h-9 w-12 shrink-0 rounded-sm" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <div className="space-y-3" aria-hidden>
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Card>
    </div>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function ClipsList() {
  const { t } = useTranslation();
  const clips = useDocsStore((s) => s.clips);
  const addClip = useDocsStore((s) => s.addClip);
  const me = useAuthStore((a) => a.principal?.id ?? "usr_1");
  const [query, setQuery] = React.useState("");
  const [showArchived, setShowArchived] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const firstLoad = useFirstLoad();

  const q = query.trim().toLowerCase();
  const list = clips
    .filter((c) => (showArchived ? true : !c.archived))
    .filter(
      (c) =>
        q === "" ||
        c.title.toLowerCase().includes(q) ||
        c.transcript.toLowerCase().includes(q) ||
        (c.hashtags ?? []).some((h) => h.toLowerCase().includes(q)),
    );

  const selected = clips.find((c) => c.id === selectedId) ?? list[0] ?? null;

  if (firstLoad) {
    return <ClipsSkeleton label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
      <Card>
        <div className="mb-2 flex items-center gap-2">
          <h3 className="flex items-center gap-1 text-base font-semibold text-fg">
            <VideoCamera size={18} aria-hidden /> {t("docs.clips")}
          </h3>
          <Button className="ml-auto" onClick={() => addClip(t("docs.newClip"), me)}>
            <Record size={16} aria-hidden /> {t("docs.recordClip")}
          </Button>
        </div>

        <div className="relative mb-2">
          <MagnifyingGlass size={16} aria-hidden className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("docs.clip.searchPh")}
            aria-label={t("docs.clip.searchPh")}
            className="h-11 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
        <label className="mb-2 inline-flex items-center gap-2 text-base text-fg">
          <input type="checkbox" checked={showArchived} onChange={() => setShowArchived((v) => !v)} className="h-4 w-4 accent-accent" />
          <Archive size={16} aria-hidden /> {t("docs.clip.showArchived")}
        </label>

        {list.length === 0 ? (
          <EmptyState icon={<VideoCamera size={28} aria-hidden />} title={t("docs.clip.empty")} />
        ) : (
          <ul className="space-y-2">
            {list.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSelectedId(c.id)}
                  aria-current={selected?.id === c.id}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md border p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    selected?.id === c.id ? "border-accent bg-surface" : "border-border hover:bg-surface",
                  )}
                >
                  <span className="flex h-9 w-12 items-center justify-center rounded-sm bg-surface text-muted">
                    <VideoCamera size={18} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base text-fg">{c.title}</span>
                    <span className="block truncate text-base text-muted">
                      {MEMBER_NAMES[c.authorId] ?? c.authorId} · {fmt(c.durationSec)}
                    </span>
                  </span>
                  {c.summary ? <Sparkle size={16} aria-hidden className="text-accent" /> : null}
                  {c.privacy === "link" ? <Badge tone="warning">{t("docs.clip.privacy.link")}</Badge> : null}
                  <span className="inline-flex items-center gap-1 text-base text-muted">
                    <Eye size={14} aria-hidden /> {c.views}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {selected ? (
        <ClipDetail clip={selected} />
      ) : (
        <Card>
          <EmptyState icon={<VideoCamera size={28} aria-hidden />} title={t("docs.clip.selectClip")} />
        </Card>
      )}
    </div>
  );
}
