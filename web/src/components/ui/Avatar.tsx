import * as RAvatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/cn";
import { avatarColor } from "@/lib/avatarColor";

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
        "inline-flex select-none items-center justify-center overflow-hidden rounded-full text-white",
        className,
      )}
      // Per-identity colour (ui.md A1) so people are visually distinct; white
      // initials stay legible because the palette is all dark-enough tones.
      style={{ width: size, height: size, backgroundColor: avatarColor(name) }}
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
