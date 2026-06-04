import * as React from "react";
import * as RTooltip from "@radix-ui/react-tooltip";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <RTooltip.Provider delayDuration={300}>{children}</RTooltip.Provider>;
}

export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <RTooltip.Root>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          sideOffset={6}
          className="z-50 rounded-md border border-border bg-raised px-2.5 py-1.5 text-base text-fg shadow-md"
        >
          {label}
          <RTooltip.Arrow className="fill-[var(--border)]" />
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}
