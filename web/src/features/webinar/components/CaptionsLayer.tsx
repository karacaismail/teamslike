import * as React from "react";
import { useTranslation } from "react-i18next";
import { ClosedCaptioning } from "@/lib/icons";
import { cn } from "@/lib/cn";

// Simulated live captions (the Translation/Captions seam consumed from Faz 4).
const LINES = [
  "Welcome everyone to the AURA launch.",
  "Today we unveil the 2030 roadmap.",
  "First: real-time translation in 70+ languages.",
  "Then: the new conversation-intelligence layer.",
];

export function CaptionsLayer() {
  const { t } = useTranslation();
  const [on, setOn] = React.useState(true);
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setI((x) => (x + 1) % LINES.length), 3000);
    return () => clearInterval(id);
  }, [on]);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-raised px-3 py-2">
      <button
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-base",
          on ? "border-accent text-accent" : "border-border text-muted",
        )}
      >
        <ClosedCaptioning size={16} aria-hidden /> {t("webinar.captions")}
      </button>
      {on ? (
        <span className="flex-1 truncate text-base text-fg" aria-live="polite">
          {LINES[i]}
        </span>
      ) : null}
    </div>
  );
}
