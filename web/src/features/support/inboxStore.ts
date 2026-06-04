import { create } from "zustand";
import { INBOXES } from "./data";
import type { ConversationStatus, Inbox } from "./types";

export type StatusFilter = "all" | ConversationStatus;

interface InboxState {
  inboxes: Inbox[];
  activeInboxId: string | null; // null = all inboxes
  filterStatus: StatusFilter;
  setInbox: (id: string | null) => void;
  setFilter: (status: StatusFilter) => void;
  reset: () => void;
}

export const useInboxStore = create<InboxState>((set) => ({
  inboxes: INBOXES,
  activeInboxId: null,
  filterStatus: "all",
  setInbox: (id) => set({ activeInboxId: id }),
  setFilter: (status) => set({ filterStatus: status }),
  reset: () => set({ activeInboxId: null, filterStatus: "all" }),
}));
