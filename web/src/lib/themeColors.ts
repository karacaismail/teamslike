/** User-selectable accent palette (per request). `name` is a plain tooltip
 *  label; the swatch itself communicates the colour. */
export interface ThemeColor {
  name: string;
  hex: string;
}

export const THEME_COLORS: ThemeColor[] = [
  { name: "Cyan", hex: "#00FFFF" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Red", hex: "#FF0000" },
  { name: "Green", hex: "#00FF00" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Light purple", hex: "#DDA0DD" },
  { name: "Indigo", hex: "#4B0082" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Tan", hex: "#D2B48C" },
  { name: "Brown", hex: "#654321" },
  { name: "Light gray", hex: "#D3D3D3" },
  { name: "Gray", hex: "#808080" },
  { name: "Dark gray", hex: "#333333" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
];

/**
 * Pick black or white text for legibility on a given background hex, using the
 * WCAG relative-luminance formula. So even bright accents (yellow, cyan) keep
 * readable button text.
 */
export function readableOn(hex: string): "#000000" | "#ffffff" {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.4 ? "#000000" : "#ffffff";
}
