import * as React from "react";

/**
 * WAI-ARIA Tabs keyboard pattern for custom tab bars.
 * Returns an onKeyDown handler for tab buttons: ArrowLeft/Up → prev,
 * ArrowRight/Down → next (wraps), Home/End → first/last. Moves selection AND
 * focus (roving). Each tab button must carry `data-tab={id}` and live inside a
 * `[role="tablist"]`; set `tabIndex={active === id ? 0 : -1}` for roving focus.
 */
export function useTabKeys<T extends string>(
  ids: readonly T[],
  active: T,
  setActive: (id: T) => void,
) {
  return React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const idx = ids.indexOf(active);
      if (idx < 0) return;
      let next = idx;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = (idx + 1) % ids.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          next = (idx - 1 + ids.length) % ids.length;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = ids.length - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      const nextId = ids[next];
      setActive(nextId);
      const list = e.currentTarget.closest('[role="tablist"]');
      (list?.querySelector(`[data-tab="${nextId}"]`) as HTMLElement | null)?.focus();
    },
    [ids, active, setActive],
  );
}
