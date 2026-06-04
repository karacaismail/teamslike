import { useTranslation } from "react-i18next";
import { X, CheckCircle, Info, WarningCircle } from "@/lib/icons";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/cn";

/** Global toast region (aria-live). Mounted once in the app shell. */
export function ToastViewport() {
  const { t } = useTranslation();
  const { toasts, dismiss } = useToastStore();

  return (
    <div
      role="region"
      aria-label={t("toast.region")}
      className="fixed bottom-4 right-4 z-[60] flex w-[min(92vw,22rem)] flex-col gap-2"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.tone === "positive"
            ? CheckCircle
            : toast.tone === "danger"
              ? WarningCircle
              : Info;
        return (
          <div
            key={toast.id}
            role="status"
            className="flex items-start gap-3 rounded-md border border-border bg-raised p-3 shadow-lg"
          >
            <Icon
              size={22}
              weight="fill"
              aria-hidden
              className={cn(
                toast.tone === "positive" && "text-positive",
                toast.tone === "danger" && "text-danger",
                toast.tone === "neutral" && "text-accent",
              )}
            />
            <div className="flex-1">
              <div className="text-base font-semibold text-fg">{toast.title}</div>
              {toast.description ? (
                <div className="text-base text-muted">{toast.description}</div>
              ) : null}
            </div>
            {toast.action ? (
              <button
                onClick={() => {
                  toast.action!.onAction();
                  dismiss(toast.id);
                }}
                className="rounded-md px-2 py-1 text-base font-medium text-accent hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {toast.action.label}
              </button>
            ) : null}
            <button
              onClick={() => dismiss(toast.id)}
              aria-label={t("toast.dismiss")}
              className="rounded-md p-1 text-muted hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
