import { cn } from "@/lib/cn";
import type { Presence } from "@/types/domain";

const toneByPresence: Record<Presence, string> = {
  online: "bg-positive",
  away: "bg-warning",
  offline: "bg-muted",
};

/** Decorative presence indicator. Always pair with a text label for AAA. */
export function PresenceDot({
  presence,
  className,
}: {
  presence: Presence;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full ring-2 ring-[var(--raised)]",
        toneByPresence[presence],
        className,
      )}
    />
  );
}
