import * as React from "react";
import { useUIStore } from "@/store/uiStore";

/**
 * Guard unsaved work (J6). Two layers:
 *  - registers the surface's dirtiness in the UI store so the shell-level
 *    `UnsavedNavGuard` can block in-app route changes (back button / nav click);
 *  - adds a `beforeunload` listener so reload / tab-close also warns.
 *
 * `key` namespaces the surface (e.g. "messaging-composer") so multiple dirty
 * surfaces don't clobber each other.
 */
export function useUnsavedGuard(key: string, dirty: boolean): void {
  const setDirty = useUIStore((s) => s.setDirty);

  React.useEffect(() => {
    setDirty(key, dirty);
    return () => setDirty(key, false);
  }, [key, dirty, setDirty]);

  React.useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}
