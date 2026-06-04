import { MOCK_PRINCIPAL, MOCK_TENANTS, MOCK_WORKSPACES } from "./mockData";
import { COMMANDS } from "@/data/commands";
import { TEAM } from "@/data/team";
import type {
  Command,
  Principal,
  TeamMember,
  Tenant,
  Workspace,
} from "@/types/domain";

/**
 * In-memory mock API that mirrors the FastAPI contract shape. Swap this module
 * for an OpenAPI-typed httpClient and screens/logic stay unchanged.
 */
const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  async getSession(): Promise<Principal> {
    await delay();
    return MOCK_PRINCIPAL;
  },
  async listTenants(): Promise<Tenant[]> {
    await delay();
    return MOCK_TENANTS;
  },
  async listWorkspaces(tenantId: string): Promise<Workspace[]> {
    await delay();
    return MOCK_WORKSPACES.filter((w) => w.tenantId === tenantId);
  },
  async listMembers(): Promise<TeamMember[]> {
    await delay();
    return TEAM;
  },
  async listCommands(permissions: string[]): Promise<Command[]> {
    await delay(80);
    return COMMANDS.filter((c) => !c.requires || permissions.includes(c.requires));
  },
};
