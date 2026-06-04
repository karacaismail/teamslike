import { useTranslation } from "react-i18next";
import { File as FileIcon, DownloadSimple, Image as ImageIcon } from "@/lib/icons";
import { useToastStore } from "@/store/toastStore";
import { downloadText } from "@/lib/download";
import type { FileAttachment } from "../types";

function fmtSize(kb: number) {
  return kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

/** File / image attachment (all competitors). Upload + storage are mocked. */
export function FileMessage({ file }: { file: FileAttachment }) {
  const { t } = useTranslation();
  const push = useToastStore((s) => s.push);

  if (file.isImage) {
    return (
      <div className="max-w-xs overflow-hidden rounded-lg border border-border">
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-accent/40 to-surface text-muted">
          <ImageIcon size={36} aria-hidden />
        </div>
        <div className="flex items-center justify-between gap-2 px-2 py-1 text-base">
          <span className="truncate text-fg">{file.name}</span>
          <span className="shrink-0 text-muted">{fmtSize(file.sizeKb)}</span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        // Real (placeholder) download so the success toast is true (J4).
        downloadText(file.name, `${file.name}\n(${file.fileType.toUpperCase()} · ${fmtSize(file.sizeKb)}) — demo placeholder.`, "text/plain");
        push({ title: t("messaging.downloadMock"), tone: "neutral" });
      }}
      className="flex items-center gap-3 rounded-lg border border-border bg-bg px-3 py-2 text-left hover:border-accent"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface text-accent">
        <FileIcon size={22} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base text-fg">{file.name}</span>
        <span className="block text-base text-muted">
          {file.fileType.toUpperCase()} · {fmtSize(file.sizeKb)}
        </span>
      </span>
      <DownloadSimple size={18} className="ml-1 text-muted" aria-hidden />
    </button>
  );
}
