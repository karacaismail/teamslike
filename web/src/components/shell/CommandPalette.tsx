import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlass, User } from "@/lib/icons";
import { Modal } from "@/components/ui/Modal";
import { mockApi } from "@/lib/mockApi";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useAskCopilot } from "@/lib/useCopilot";
import { DOMAINS } from "@/data/domains";
import { searchAll, type SearchResult } from "@/lib/search";
import type { Command } from "@/types/domain";
import { cn } from "@/lib/cn";

const groupOrder = ["ai", "navigate", "action"] as const;
const groupLabelKey: Record<string, string> = {
  ai: "command.groupAi",
  navigate: "command.groupNavigate",
  action: "command.groupAction",
};

/**
 * AI-orchestration entry point + global search (A2). Surfaces deep-linkable
 * content results (members, domains, registered providers) above the RBAC
 * commands, with full keyboard support and ARIA combobox/listbox semantics.
 */
export function CommandPalette() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const open = useUIStore((s) => s.paletteOpen);
  const setPaletteOpen = useUIStore((s) => s.setPaletteOpen);
  const ask = useAskCopilot();
  const principal = useAuthStore((s) => s.principal);
  const permissions = principal?.permissions ?? [];

  const { data: commands = [] } = useQuery({
    queryKey: ["commands", permissions],
    queryFn: () => mockApi.listCommands(permissions),
    enabled: open,
  });

  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);

  const title = React.useCallback(
    (c: Command) =>
      c.group === "navigate"
        ? t("command.goto", { name: t(c.prompt ?? "") })
        : t(c.titleKey),
    [t],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return commands.filter((c) => title(c).toLowerCase().includes(q));
  }, [commands, query, title]);

  // Global search results (cross-cutting open-host service) shown first.
  const results = React.useMemo<SearchResult[]>(
    () => (query.trim() ? searchAll(query) : []),
    [query],
  );
  const orderedCommands = React.useMemo(
    () => groupOrder.flatMap((g) => filtered.filter((c) => c.group === g)),
    [filtered],
  );
  const flatLen = results.length + orderedCommands.length;

  React.useEffect(() => setActive(0), [query, open]);

  const activeDomain = DOMAINS.find((d) => location.pathname.startsWith(d.path));
  const contextLabel = activeDomain ? t(activeDomain.labelKey) : t("common.overview");

  const resultTitle = (r: SearchResult) => (r.labelKey ? t(r.labelKey) : r.title);

  const invokeAt = (i: number) => {
    if (i < 0 || i >= flatLen) return;
    setPaletteOpen(false);
    setQuery("");
    if (i < results.length) {
      navigate(results[i].href);
      return;
    }
    const c = orderedCommands[i - results.length];
    if (!c) return;
    if (c.group === "navigate" && c.to) navigate(c.to);
    else if (c.group === "ai") ask(c.prompt ?? title(c), contextLabel);
    else if (c.group === "action") {
      if (c.key === "action.newTask") navigate("/docs");
      else if (c.key === "action.search") navigate("/members");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flatLen - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      invokeAt(active);
    }
  };

  const activeId =
    active < results.length
      ? results[active]
        ? `cmd-res-${active}`
        : undefined
      : orderedCommands[active - results.length]
        ? `cmd-${orderedCommands[active - results.length].key}`
        : undefined;

  let idx = -1;

  return (
    <Modal
      open={open}
      onOpenChange={setPaletteOpen}
      title={t("shell.commandPalette")}
      hideTitle
      className="top-[10vh] p-0"
    >
      <div className="flex items-center gap-2 border-b border-border px-4">
        <MagnifyingGlass size={20} aria-hidden className="text-muted" />
        <input
          autoFocus
          role="combobox"
          aria-expanded={true}
          aria-controls="cmd-listbox"
          aria-activedescendant={activeId}
          aria-label={t("shell.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("shell.searchPlaceholder")}
          className="h-14 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-muted"
        />
      </div>
      <ul
        id="cmd-listbox"
        role="listbox"
        aria-label={t("shell.commandPalette")}
        className="max-h-[50vh] overflow-y-auto p-2"
      >
        {flatLen === 0 ? (
          <li className="px-3 py-6 text-center text-base text-muted">
            {t("command.empty")}
          </li>
        ) : (
          <>
            {results.length > 0 ? (
              <li role="presentation">
                <div className="px-3 pb-1 pt-2 text-base font-semibold text-muted">
                  {t("command.groupResults")}
                </div>
                <ul role="presentation" className="m-0 list-none p-0">
                  {results.map((r, ri) => {
                    idx += 1;
                    const i = idx;
                    const Icon = r.kind === "domain" ? (DOMAINS.find((d) => d.key === r.id)?.icon ?? MagnifyingGlass) : User;
                    const selected = i === active;
                    return (
                      <li
                        key={`${r.kind}-${r.id}-${ri}`}
                        id={`cmd-res-${i}`}
                        role="option"
                        aria-selected={selected}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => invokeAt(i)}
                        className={cn(
                          "flex h-11 cursor-pointer items-center gap-3 rounded-md px-3 text-base",
                          selected ? "bg-accent text-accent-fg" : "text-fg",
                        )}
                      >
                        <Icon size={20} aria-hidden />
                        <span className="flex-1 truncate">
                          {resultTitle(r)}
                          {r.subtitle ? <span className="text-muted"> · {r.subtitle}</span> : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ) : null}

            {groupOrder.map((group) => {
              const items = filtered.filter((c) => c.group === group);
              if (items.length === 0) return null;
              return (
                <li key={group} role="presentation">
                  <div className="px-3 pb-1 pt-2 text-base font-semibold text-muted">
                    {t(groupLabelKey[group])}
                  </div>
                  <ul role="presentation" className="m-0 list-none p-0">
                    {items.map((c) => {
                      idx += 1;
                      const i = idx;
                      const Icon = c.icon;
                      const selected = i === active;
                      return (
                        <li
                          key={c.key}
                          id={`cmd-${c.key}`}
                          role="option"
                          aria-selected={selected}
                          onMouseEnter={() => setActive(i)}
                          onClick={() => invokeAt(i)}
                          className={cn(
                            "flex h-11 cursor-pointer items-center gap-3 rounded-md px-3 text-base",
                            selected ? "bg-accent text-accent-fg" : "text-fg",
                          )}
                        >
                          <Icon size={20} aria-hidden />
                          <span className="flex-1">{title(c)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </>
        )}
      </ul>
      <div className="flex items-center justify-between border-t border-border px-4 py-2 text-base text-muted">
        <span>
          {t("copilot.contextLabel")}: {contextLabel}
        </span>
        <span aria-hidden>↑ ↓ · Enter</span>
      </div>
    </Modal>
  );
}
