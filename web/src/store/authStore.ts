import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Principal, RoleKey } from "@/types/domain";
import { MOCK_PRINCIPAL } from "@/lib/mockData";
import { ROLES } from "@/data/roles";

interface AuthState {
  principal: Principal | null;
  status: "anonymous" | "authenticated";
  login: (email: string) => void;
  logout: () => void;
  /** Demo: switch the active role to showcase live RBAC. */
  setRole: (role: RoleKey) => void;
  can: (permission: string) => boolean;
}

/** Session persists across reloads (J1) so a refresh no longer dumps the user
 *  back to the login screen and loses their place. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      principal: null,
      status: "anonymous",
      login: (email) =>
        set({
          principal: { ...MOCK_PRINCIPAL, email: email || MOCK_PRINCIPAL.email },
          status: "authenticated",
        }),
      logout: () => set({ principal: null, status: "anonymous" }),
      setRole: (role) =>
        set((s) =>
          s.principal
            ? {
                principal: {
                  ...s.principal,
                  role,
                  permissions: ROLES[role].permissions,
                },
              }
            : {},
        ),
      can: (permission) => {
        const p = get().principal;
        return !!p && p.permissions.includes(permission);
      },
    }),
    {
      name: "aura-auth",
      partialize: (s) => ({ status: s.status, principal: s.principal }),
    },
  ),
);
