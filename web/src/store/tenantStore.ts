import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_TENANTS, MOCK_WORKSPACES } from "@/lib/mockData";

interface TenantState {
  tenantId: string;
  workspaceId: string;
  setTenant: (tenantId: string) => void;
  setWorkspace: (workspaceId: string) => void;
}

const firstTenant = MOCK_TENANTS[0];
const firstWorkspace = MOCK_WORKSPACES.find((w) => w.tenantId === firstTenant.id)!;

/** Last selected tenant/workspace persists across reloads (J1). */
export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenantId: firstTenant.id,
      workspaceId: firstWorkspace.id,
      setTenant: (tenantId) => {
        const ws = MOCK_WORKSPACES.find((w) => w.tenantId === tenantId);
        set({ tenantId, workspaceId: ws ? ws.id : "" });
      },
      setWorkspace: (workspaceId) => set({ workspaceId }),
    }),
    {
      name: "aura-tenant",
      partialize: (s) => ({ tenantId: s.tenantId, workspaceId: s.workspaceId }),
    },
  ),
);
