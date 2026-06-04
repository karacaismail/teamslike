import { create } from "zustand";

export type ToastTone = "neutral" | "positive" | "danger";

export interface ToastAction {
  label: string;
  /** Invoked when the user clicks the action (e.g. "Undo"); toast then dismisses. */
  onAction: () => void;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  action?: ToastAction;
}

interface ToastState {
  toasts: Toast[];
  push: (t: { title: string; description?: string; tone?: ToastTone; action?: ToastAction; durationMs?: number }) => void;
  dismiss: (id: string) => void;
}

const uid = () => Math.random().toString(36).slice(2);

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: ({ title, description, tone = "neutral", action, durationMs }) => {
    const id = uid();
    set((s) => ({ toasts: [...s.toasts, { id, title, description, tone, action }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      durationMs ?? (action ? 6000 : 4000),
    );
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
