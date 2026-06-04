/**
 * Deterministic avatar background from a display name (ui.md A1).
 *
 * Before this, every avatar used the single accent colour, so all people looked
 * identical. Here a stable hash of the name picks one of a fixed palette whose
 * entries are all dark enough (~700-level) to clear AA contrast against the
 * white initials — so avatars become visually distinct while staying legible.
 */
export const AVATAR_PALETTE = [
  "#4f46e5", // indigo
  "#0e7490", // cyan
  "#b91c1c", // red
  "#a16207", // amber
  "#15803d", // green
  "#7c3aed", // violet
  "#1d4ed8", // blue
  "#be185d", // pink
  "#0f766e", // teal
  "#9333ea", // purple
] as const;

export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}
