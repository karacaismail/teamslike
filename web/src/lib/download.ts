/**
 * Trigger a real client-side file download (J4). Several "Export / Download"
 * CTAs previously only fired a success toast without producing anything;
 * routing them through here makes the success message true.
 * No-ops safely in environments without Blob/URL support (e.g. jsdom in tests).
 */
export function downloadText(filename: string, content: string, mime = "text/plain"): void {
  try {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    /* environment without Blob/URL.createObjectURL (tests) — silently skip */
  }
}
