import { create } from "zustand";
import { DESKS, RESERVATIONS } from "./data";
import { isDeskFree } from "./workspace";
import type { Desk, DeskSlot, Reservation } from "./types";

let seq = 0;
const rid = () => `rsv_${Date.now()}_${seq++}`;
const cloneReservations = (): Reservation[] => RESERVATIONS.map((r) => ({ ...r }));

/** The acting user (would come from auth/session on the real backend). */
const SELF_ID = "usr_1";

interface WorkspaceState {
  desks: Desk[];
  reservations: Reservation[];
  dateISO: string;
  slot: DeskSlot;

  setDate: (dateISO: string) => void;
  setSlot: (slot: DeskSlot) => void;
  /** Reserve a desk for the active date+slot; no-op when it collides. */
  reserve: (deskId: string) => void;
  cancel: (reservationId: string) => void;
  checkIn: (reservationId: string) => void;
  reset: () => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  desks: DESKS,
  reservations: cloneReservations(),
  dateISO: todayISO(),
  slot: "full",

  setDate: (dateISO) => set({ dateISO }),
  setSlot: (slot) => set({ slot }),

  reserve: (deskId) => {
    const { reservations, dateISO, slot } = get();
    if (!isDeskFree(reservations, deskId, dateISO, slot)) return;
    const reservation: Reservation = {
      id: rid(),
      deskId,
      userId: SELF_ID,
      dateISO,
      slot,
      checkedIn: false,
    };
    set({ reservations: [...reservations, reservation] });
  },

  cancel: (reservationId) =>
    set((s) => ({ reservations: s.reservations.filter((r) => r.id !== reservationId) })),

  checkIn: (reservationId) =>
    set((s) => ({
      reservations: s.reservations.map((r) => (r.id === reservationId ? { ...r, checkedIn: true } : r)),
    })),

  reset: () => set({ reservations: cloneReservations(), dateISO: todayISO(), slot: "full" }),
}));

export const WORKSPACE_SELF_ID = SELF_ID;
