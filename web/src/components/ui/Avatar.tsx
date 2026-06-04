import * as RAvatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/cn";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  src,
  size = 36,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  return (
    <RAvatar.Root
      className={cn(
        "inline-flex select-none items-center justify-center overflow-hidden rounded-full bg-accent text-accent-fg",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <RAvatar.Image src={src} alt={name} className="h-full w-full object-cover" />
      ) : null}
      <RAvatar.Fallback className="text-base font-semibold" delayMs={src ? 300 : 0}>
        {initials(name)}
      </RAvatar.Fallback>
    </RAvatar.Root>
  );
}
