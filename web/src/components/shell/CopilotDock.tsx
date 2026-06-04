import * as React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sparkle,
  X,
  Broom,
  PaperPlaneRight,
  CircleNotch,
  CheckCircle,
  Circle,
} from "@/lib/icons";
import { useCopilotStore } from "@/store/copilotStore";
import { useUIStore } from "@/store/uiStore";
import { useAskCopilot } from "@/lib/useCopilot";
import { DOMAINS } from "@/data/domains";
import { IconButton, Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { AgentStep } from "@/types/domain";

function StepRow({ step }: { step: AgentStep }) {
  return (
    <li className="flex items-center gap-2 text-base">
      {step.status === "done" ? (
        <CheckCircle size={18} weight="fill" className="text-positive" aria-hidden />
      ) : step.status === "running" ? (
        <CircleNotch size={18} className="animate-spin text-accent" aria-hidden />
      ) : (
        <Circle size={18} className="text-muted" aria-hidden />
      )}
      <span className={step.status === "pending" ? "text-muted" : "text-fg"}>
        {step.label}
      </span>
    </li>
  );
}

export function CopilotDock() {
  const { t } = useTranslation();
  const location = useLocation();
  const { messages, streaming, clear } = useCopilotStore();
  const setCopilotOpen = useUIStore((s) => s.setCopilotOpen);
  const ask = useAskCopilot();
  const [text, setText] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);

  const activeDomain = DOMAINS.find((d) => location.pathname.startsWith(d.path));
  const contextLabel = activeDomain ? t(activeDomain.labelKey) : t("common.overview");

  React.useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const submit = () => {
    if (!text.trim()) return;
    ask(text, contextLabel);
    setText("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <aside
      aria-label={t("copilot.title")}
      className="flex h-full w-80 flex-col border-l border-border bg-surface"
    >
      <header className="flex items-center gap-2 border-b border-border p-3">
        <Sparkle size={22} weight="fill" className="text-accent" aria-hidden />
        <div className="flex-1">
          <div className="text-base font-semibold text-fg">{t("copilot.title")}</div>
          <div className="text-base text-muted">{t("copilot.subtitle")}</div>
        </div>
        <IconButton label={t("copilot.clear")} onClick={clear}>
          <Broom size={20} aria-hidden />
        </IconButton>
        <IconButton label={t("shell.closeCopilot")} onClick={() => setCopilotOpen(false)}>
          <X size={20} aria-hidden />
        </IconButton>
      </header>

      <div className="px-3 py-2">
        <Badge tone="accent">
          {t("copilot.contextLabel")}: {contextLabel}
        </Badge>
      </div>

      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto px-3 pb-3"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="rounded-md bg-raised p-3 text-base text-muted">
            {t("copilot.greeting")}
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "rounded-md p-3 text-base",
                m.role === "user" ? "bg-accent text-accent-fg" : "bg-raised text-fg",
              )}
            >
              <div className="mb-1 text-base font-semibold opacity-80">
                {m.role === "user" ? t("copilot.you") : t("copilot.assistant")}
              </div>

              {m.steps && m.steps.length > 0 ? (
                <ul className="mb-2 space-y-1">
                  {m.steps.map((st) => (
                    <StepRow key={st.id} step={st} />
                  ))}
                </ul>
              ) : null}

              {m.text ? <p>{m.text}</p> : null}

              {m.suggestions && m.suggestions.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="w-full text-base text-muted">
                    {t("copilot.suggestionsTitle")}
                  </span>
                  {m.suggestions.map((sg, i) => (
                    <button
                      key={i}
                      onClick={() => ask(sg.prompt, contextLabel)}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-base text-accent hover:bg-raised"
                    >
                      {sg.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border p-3">
        <label htmlFor="copilot-input" className="sr-only">
          {t("copilot.placeholder")}
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="copilot-input"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("copilot.placeholder")}
            className="min-h-[2.75rem] flex-1 resize-none rounded-md border border-border bg-raised p-2 text-base text-fg outline-none placeholder:text-muted"
          />
          <IconButton
            label={t("copilot.send")}
            variant="primary"
            onClick={submit}
            disabled={streaming || !text.trim()}
          >
            <PaperPlaneRight size={20} aria-hidden />
          </IconButton>
        </div>
      </div>
    </aside>
  );
}
