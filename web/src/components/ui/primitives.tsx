import * as React from "react";
import { cn } from "@/lib/cn";

/* ---------------------------------- Button --------------------------------- */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg hover:opacity-90",
  secondary: "bg-surface text-fg border border-border hover:bg-raised",
  ghost: "text-fg hover:bg-surface",
  danger: "bg-danger text-white hover:opacity-90",
};

const buttonSizes: Record<ButtonSize, string> = {
  md: "h-11 px-4", // 44px min target (WCAG AAA 2.5.5)
  lg: "h-12 px-5",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-base font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg motion-reduce:transition-none",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

/* -------------------------------- IconButton ------------------------------- */
export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, label, variant = "ghost", ...props }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg motion-reduce:transition-none",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  ),
);
IconButton.displayName = "IconButton";

/* ---------------------------------- Badge ---------------------------------- */
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "positive" | "warning" | "danger";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-surface text-muted border-border",
    accent: "bg-surface text-accent border-border",
    positive: "bg-surface text-positive border-border",
    warning: "bg-surface text-warning border-border",
    danger: "bg-surface text-danger border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-base",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ----------------------------------- Kbd ----------------------------------- */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center rounded-sm border border-border bg-surface px-1.5 py-0.5 text-base font-medium text-muted">
      {children}
    </kbd>
  );
}

/* -------------------------------- Skeleton --------------------------------- */
/** Loading placeholder. The `.shimmer` utility (see index.css) sweeps a soft
 *  sheen across a surface-toned base and self-neutralizes under
 *  prefers-reduced-motion, leaving a calm static block. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("shimmer rounded-md motion-reduce:animate-none", className)}
      aria-hidden
    />
  );
}

/* ------------------------------ ListSkeleton ------------------------------- */
/** Shimmering placeholder rows for list/panel loading states. Announces a
 *  polite status to assistive tech via the optional `label`. */
export function ListSkeleton({
  rows = 6,
  label,
  className,
}: {
  rows?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3 p-4", className)} role="status" aria-live="polite">
      {label ? <span className="sr-only">{label}</span> : null}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3" aria-hidden>
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------- Card ---------------------------------- */
export function Card({
  children,
  className,
  as: Tag = "section",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Tag
      className={cn(
        "rounded-lg border border-border bg-raised p-5 shadow-sm",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* -------------------------------- EmptyState ------------------------------- */
/** Standard empty-list placeholder: icon + title + optional hint/action. */
export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
      {icon ? <span className="text-muted" aria-hidden>{icon}</span> : null}
      <p className="text-base font-medium text-fg">{title}</p>
      {hint ? <p className="max-w-sm text-base text-muted">{hint}</p> : null}
      {action}
    </div>
  );
}

/* -------------------------------- ErrorState ------------------------------- */
/** Standard error placeholder with a retry affordance. */
export function ErrorState({
  icon,
  title,
  retryLabel,
  onRetry,
}: {
  icon?: React.ReactNode;
  title: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
      {icon ? <span className="text-danger" aria-hidden>{icon}</span> : null}
      <p className="text-base font-medium text-danger">{title}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>{retryLabel ?? "Retry"}</Button>
      ) : null}
    </div>
  );
}

/* --------------------------------- StatCard -------------------------------- */
export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-raised p-4">
      <div className="text-base text-muted">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-fg">{value}</div>
    </div>
  );
}
