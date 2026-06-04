import * as React from "react";
import { useTranslation } from "react-i18next";
import { X, Trash } from "@/lib/icons";
import { useMeetingStore } from "../store";
import { cn } from "@/lib/cn";

const COLORS = ["#111827", "#dc2626", "#2563eb", "#16a34a", "#d97706"];

/** Lightweight collaborative whiteboard (Zoom/Teams/Jitsi). Freehand SVG strokes. */
export function Whiteboard() {
  const { t } = useTranslation();
  const toggleWhiteboard = useMeetingStore((s) => s.toggleWhiteboard);
  const [strokes, setStrokes] = React.useState<{ points: string; color: string }[]>([]);
  const [color, setColor] = React.useState(COLORS[0]);
  const drawing = React.useRef(false);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const pt = (e: React.PointerEvent) => {
    const r = svgRef.current?.getBoundingClientRect();
    return `${Math.round(e.clientX - (r?.left ?? 0))},${Math.round(e.clientY - (r?.top ?? 0))}`;
  };

  const down = (e: React.PointerEvent) => {
    drawing.current = true;
    setStrokes((s) => [...s, { points: pt(e), color }]);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = pt(e);
    setStrokes((s) => {
      if (s.length === 0) return s;
      const copy = s.slice();
      const last = copy[copy.length - 1];
      copy[copy.length - 1] = { ...last, points: `${last.points} ${p}` };
      return copy;
    });
  };
  const up = () => {
    drawing.current = false;
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-[#e5e7eb] bg-[#f8fafc] p-2">
        <span className="text-base font-semibold text-[#111827]">{t("meetings.whiteboard")}</span>
        <div className="ml-2 flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={c}
              aria-pressed={color === c}
              className={cn("h-7 w-7 rounded-full border-2", color === c ? "border-[#111827]" : "border-transparent")}
              style={{ background: c }}
            />
          ))}
        </div>
        <button
          onClick={() => setStrokes([])}
          className="ml-auto inline-flex h-9 items-center gap-1 rounded-md border border-[#e5e7eb] px-2 text-base text-[#111827] hover:bg-[#eef2f7]"
        >
          <Trash size={16} aria-hidden /> {t("meetings.clear")}
        </button>
        <button
          onClick={toggleWhiteboard}
          aria-label={t("meetings.closeWhiteboard")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e5e7eb] text-[#111827] hover:bg-[#eef2f7]"
        >
          <X size={18} aria-hidden />
        </button>
      </div>
      <svg
        ref={svgRef}
        role="img"
        aria-label={t("meetings.whiteboard")}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        className="flex-1 touch-none"
      >
        {strokes.map((s, i) => (
          <polyline key={i} points={s.points} fill="none" stroke={s.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
    </div>
  );
}
