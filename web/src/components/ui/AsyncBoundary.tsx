import * as React from "react";
import { AppErrorBoundary } from "@/components/shell/AppErrorBoundary";
import { ListSkeleton } from "@/components/ui/primitives";

/**
 * Standard async wrapper: an error boundary (render-error guard) around a
 * Suspense boundary (loading guard). Lazy/suspending children show a shimmering
 * `ListSkeleton` while pending and the shared error fallback on failure.
 *
 * Mock note: the app renders synchronously from store seeds today, so the
 * skeleton is mainly exercised on route-level code-split loads. The pattern is
 * in place for when slices move to suspending TanStack Query reads.
 */
export function AsyncBoundary({
  children,
  fallback,
  rows,
  label,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rows?: number;
  label?: string;
}) {
  return (
    <AppErrorBoundary>
      <React.Suspense fallback={fallback ?? <ListSkeleton rows={rows} label={label} />}>
        {children}
      </React.Suspense>
    </AppErrorBoundary>
  );
}
