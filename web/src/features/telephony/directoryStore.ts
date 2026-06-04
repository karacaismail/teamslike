import { create } from "zustand";

/**
 * Directory favorites / speed-dial. Contacts themselves are static (`CONTACTS`);
 * only the user's favorites are stateful.
 */
interface DirectoryState {
  favorites: string[]; // e164 numbers
  toggleFavorite: (e164: string) => void;
  reset: () => void;
}

export const useDirectoryStore = create<DirectoryState>((set) => ({
  favorites: [],
  toggleFavorite: (e164) =>
    set((s) => ({
      favorites: s.favorites.includes(e164)
        ? s.favorites.filter((x) => x !== e164)
        : [...s.favorites, e164],
    })),
  reset: () => set({ favorites: [] }),
}));
