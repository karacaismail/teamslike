import { create } from "zustand";
import type { AppNotification } from "@/types/domain";
import { NOTIFICATIONS } from "@/data/notifications";

interface NotificationState {
  items: AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  unread: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: NOTIFICATIONS,
  markRead: (id) =>
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),
  unread: () => get().items.filter((n) => !n.read).length,
}));
