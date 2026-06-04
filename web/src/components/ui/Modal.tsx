import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/cn";

/**
 * Accessible modal built on Radix Dialog (focus trap, Esc to close, focus
 * restore). A title is always present for screen readers, visually hidden when
 * a visible heading is not desired.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  hideTitle = false,
  className,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  hideTitle?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-[12vh] z-50 w-[min(92vw,40rem)] -translate-x-1/2 rounded-lg border border-border bg-raised shadow-xl",
            className,
          )}
        >
          {hideTitle ? (
            <VisuallyHidden>
              <Dialog.Title>{title}</Dialog.Title>
            </VisuallyHidden>
          ) : (
            <Dialog.Title className="px-5 pt-5 text-xl font-semibold text-fg">
              {title}
            </Dialog.Title>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
