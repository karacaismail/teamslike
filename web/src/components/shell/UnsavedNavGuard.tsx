import { useBlocker } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUIStore } from "@/store/uiStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

/**
 * In-app navigation guard (J6). When any surface has unsaved work (tracked in
 * the UI store via `useUnsavedGuard`), block route changes — back button, nav
 * clicks — and confirm. Only blocks on a real pathname change, so the J2 URL
 * search-param updates (?c=&t=, ?type=) never trip it.
 *
 * Lives at the shell level because `useBlocker` requires the data router; the
 * dirty surfaces themselves only set a store flag (test-safe under MemoryRouter).
 */
export function UnsavedNavGuard() {
  const { t } = useTranslation();
  const anyDirty = useUIStore((s) => Object.values(s.dirty).some(Boolean));
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      anyDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  return (
    <ConfirmDialog
      open={blocker.state === "blocked"}
      onOpenChange={(v) => {
        if (!v && blocker.state === "blocked") blocker.reset();
      }}
      title={t("unsaved.title")}
      body={t("unsaved.body")}
      confirmLabel={t("unsaved.leave")}
      cancelLabel={t("unsaved.stay")}
      variant="danger"
      onConfirm={() => {
        if (blocker.state === "blocked") blocker.proceed();
      }}
    />
  );
}
