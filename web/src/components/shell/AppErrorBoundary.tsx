import * as React from "react";
import { useTranslation } from "react-i18next";
import { useRouteError } from "react-router-dom";
import { Warning } from "@/lib/icons";
import { ErrorState } from "@/components/ui/primitives";

/** Shared fallback UI (functional → can use hooks for i18n). */
function Fallback({ onRetry }: { onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-xl p-6">
      <ErrorState
        icon={<Warning size={28} aria-hidden />}
        title={t("errors.title")}
        retryLabel={onRetry ? t("errors.reload") : undefined}
        onRetry={onRetry}
      />
    </div>
  );
}

/** App-root class boundary — catches render errors anywhere below (white-screen guard). */
export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Real backend: report to telemetry. Mock: console only.
    console.error("AppErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return <Fallback onRetry={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}

/** react-router `errorElement` — catches per-route render/loader errors. */
export function RouteError() {
  const error = useRouteError();
  console.error("RouteError:", error);
  return <Fallback onRetry={() => window.location.reload()} />;
}
