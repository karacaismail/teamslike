import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import i18n from "@/i18n";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { useAdminStore } from "@/features/admin/adminStore";
import { quotaState, proration, filterAudit, retentionExpired, dlpScan, dlpRedact, sensitivityRank, sensitivityDowngradeBlocked, barrierBlocks, flaggedTerms, aiCreditState, creditOverage } from "@/features/admin/admin";
import { fetchAudit, fetchBilling } from "@/features/admin/api";
import { AUDIT_EVENTS } from "@/features/admin/data";
import { AdminConsole } from "@/features/admin/AdminConsole";
import { AuditLogViewer } from "@/features/admin/components/AuditLogViewer";
import { SecurityPolicies } from "@/features/admin/components/SecurityPolicies";

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});

beforeEach(() => {
  useAdminStore.getState().reset();
});

describe("admin util", () => {
  it("quotaState maps ok / warn / exceeded", () => {
    expect(quotaState(50, 100)).toBe("ok");
    expect(quotaState(80, 100)).toBe("warn");
    expect(quotaState(100, 100)).toBe("exceeded");
  });

  it("proration computes the plan-change delta", () => {
    expect(proration(8, 22, 15, 30)).toBe(7); // (22-8)*15/30
  });

  it("filterAudit filters by actor and action", () => {
    expect(filterAudit(AUDIT_EVENTS, { action: "policy" }).map((e) => e.id)).toEqual(["au2"]);
    expect(filterAudit(AUDIT_EVENTS, { actorId: "usr_1" }).length).toBe(3);
  });

  it("retentionExpired compares age to policy", () => {
    expect(retentionExpired(120, 90)).toBe(true);
    expect(retentionExpired(30, 90)).toBe(false);
  });
});

describe("admin governance util (Purview-class, Teams parity)", () => {
  it("dlpScan detects card / IBAN / TC kimlik / email", () => {
    const kinds = dlpScan("pay 4111 1111 1111 1111 to user@acme.com TR330006100519786457841326 id 12345678901").map((f) => f.kind);
    expect(kinds).toContain("card");
    expect(kinds).toContain("iban");
    expect(kinds).toContain("email");
    expect(kinds).toContain("tckn");
    expect(dlpScan("hello world")).toEqual([]);
  });

  it("dlpRedact masks sensitive tokens", () => {
    const masked = dlpRedact("card 4111111111111111 mail a@b.com");
    expect(masked).not.toContain("4111111111111111");
    expect(masked).not.toContain("a@b.com");
    expect(masked).toContain("•••");
  });

  it("sensitivity labels rank and block downgrades", () => {
    expect(sensitivityRank("public")).toBe(0);
    expect(sensitivityRank("restricted")).toBe(3);
    expect(sensitivityDowngradeBlocked("confidential", "public")).toBe(true);
    expect(sensitivityDowngradeBlocked("public", "confidential")).toBe(false);
  });

  it("barrierBlocks segments forbidden groups symmetrically", () => {
    const barriers: [string, string][] = [["Research", "Sales"]];
    expect(barrierBlocks("Research", "Sales", barriers)).toBe(true);
    expect(barrierBlocks("Sales", "Research", barriers)).toBe(true);
    expect(barrierBlocks("Sales", "Sales", barriers)).toBe(false);
    expect(barrierBlocks("Sales", "Legal", barriers)).toBe(false);
  });

  it("flaggedTerms catches supervised communication-compliance terms", () => {
    expect(flaggedTerms("let's leak the insider memo", ["insider", "bribe"])).toEqual(["insider"]);
    expect(flaggedTerms("all clear", ["insider"])).toEqual([]);
  });

  it("aiCreditState + creditOverage model transparent AI billing", () => {
    expect(aiCreditState(4300, 5000)).toBe("warn"); // 86%
    expect(aiCreditState(5200, 5000)).toBe("exceeded");
    expect(creditOverage(5200, 5000, 0.01)).toBeCloseTo(2, 2); // 200 over × $0.01
    expect(creditOverage(4000, 5000, 0.01)).toBe(0);
  });
});

describe("adminStore", () => {
  it("togglePolicy flips and records an audit entry", () => {
    const before = useAdminStore.getState().audit.length;
    useAdminStore.getState().togglePolicy("pol_e2ee");
    expect(useAdminStore.getState().policies.find((p) => p.id === "pol_e2ee")!.enabled).toBe(true);
    expect(useAdminStore.getState().audit.length).toBe(before + 1);
  });

  it("addBridge appends a federation bridge", () => {
    useAdminStore.getState().addBridge("fed_matrix", "whatsapp");
    expect(useAdminStore.getState().federation.find((f) => f.id === "fed_matrix")!.bridges).toContain("whatsapp");
  });

  it("upgradePlan updates billing (UI flow, no real payment)", () => {
    useAdminStore.getState().upgradePlan("enterprise");
    expect(useAdminStore.getState().billing.plan).toBe("enterprise");
  });

  it("setPolicyConfig edits a policy config value (wired in SecurityPolicies)", () => {
    useAdminStore.getState().setPolicyConfig("pol_ret", "days", "30");
    expect(useAdminStore.getState().policies.find((p) => p.id === "pol_ret")!.config.days).toBe("30");
  });

  it("recordAudit prepends an event", () => {
    const before = useAdminStore.getState().audit.length;
    useAdminStore.getState().recordAudit("test.action", "res", "usr_1");
    expect(useAdminStore.getState().audit.length).toBe(before + 1);
    expect(useAdminStore.getState().audit[0].action).toBe("test.action");
  });
});

describe("admin API contracts", () => {
  it("fetchAudit / fetchBilling resolve", async () => {
    const audit = await fetchAudit();
    expect(audit.length).toBeGreaterThan(0);
    const billing = await fetchBilling();
    expect(billing.account.plan).toBeTruthy();
  });
});

describe("Admin UI", () => {
  const wrap = (node: ReactNode) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{node}</MemoryRouter>
    </QueryClientProvider>
  );

  it("AdminConsole renders the overview quotas", () => {
    render(wrap(<AdminConsole />));
    expect(screen.getByText("storage_gb")).toBeInTheDocument();
  });

  it("AuditLogViewer renders an audit action", () => {
    render(wrap(<AuditLogViewer />));
    expect(screen.getByText("policy.update")).toBeInTheDocument();
  });

  it("SecurityPolicies renders the governance policy tester", () => {
    render(wrap(<SecurityPolicies />));
    expect(screen.getByText("Policy tester")).toBeInTheDocument();
  });
});
