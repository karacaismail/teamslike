import * as React from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Two-way sync between a URL search param and a store-held selection (J2).
 *
 * - URL → store: applies the param on mount AND when it changes externally
 *   (e.g. a notification deep-link navigating to ?c=… while the page is mounted).
 * - store → URL: reflects the active selection into the URL with `replace`, so a
 *   reload restores it and the link is shareable, without spamming history.
 *
 * A `selfWrite` ref breaks the echo loop; the first store→URL pass is skipped so
 * an incoming deep-link is never clobbered by the initial (default) value.
 */
export function useUrlSelection(
  key: string,
  value: string,
  setValue: (v: string) => void,
  isValid?: (v: string) => boolean,
) {
  const [params, setParams] = useSearchParams();
  const param = params.get(key);
  const selfWrite = React.useRef<string | null>(null);
  const firstRun = React.useRef(true);

  // URL → store (mount + external changes)
  React.useEffect(() => {
    if (param && param !== value && param !== selfWrite.current && (!isValid || isValid(param))) {
      setValue(param);
    }
    // value/setValue intentionally excluded: we react to URL changes only.
  }, [param]); // eslint-disable-line react-hooks/exhaustive-deps

  // store → URL (skip the first commit so a deep-link isn't overwritten)
  React.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (value && params.get(key) !== value) {
      selfWrite.current = value;
      const next = new URLSearchParams(params);
      next.set(key, value);
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
}
