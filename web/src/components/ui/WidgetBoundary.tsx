import * as React from "react";
import { useTranslation } from "react-i18next";
import { Warning } from "@/lib/icons";
import { ErrorState } from "@/components/ui/primitives";

/** Compact inline fallback — sized for a single panel, not a whole page. */
function WidgetFallback() {
  const { t } = useTranslation();
  return <ErrorState icon={<Warning size={22} aria-hidden />} title={t("errors.widget")} />;
}

/**
 * Isolates one dashboard/panel widget. A render error inside `children` is
 * caught here and replaced by a small inline message, so a single failing
 * widget can't blank the surrounding screen — the rest stays interactive
 * (gemini §3.3). Renders children transparently when healthy (no extra DOM).
 */
export class WidgetBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("WidgetBoundary caught:", error);
  }

  render() {
    return this.state.hasError ? <WidgetFallback /> : this.props.children;
  }
}
