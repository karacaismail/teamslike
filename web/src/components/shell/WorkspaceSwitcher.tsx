import * as Menu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "react-router-dom";
import { CaretUpDown, Check, Buildings, UsersThree } from "@/lib/icons";
import { useTranslation } from "react-i18next";
import { MOCK_TENANTS, MOCK_WORKSPACES } from "@/lib/mockData";
import { useTenantStore } from "@/store/tenantStore";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

export function WorkspaceSwitcher() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tenantId, workspaceId, setTenant, setWorkspace } = useTenantStore();
  const push = useToastStore((s) => s.push);
  const can = useAuthStore((s) => s.can);

  const tenant = MOCK_TENANTS.find((x) => x.id === tenantId);
  const workspace = MOCK_WORKSPACES.find((x) => x.id === workspaceId);

  const select = (wsId: string, tnId: string, wsName: string) => {
    setTenant(tnId);
    setWorkspace(wsId);
    push({ title: t("toast.workspaceSwitched", { name: wsName }), tone: "positive" });
  };

  return (
    <Menu.Root>
      <Menu.Trigger
        className="flex h-11 min-w-[14rem] items-center gap-2 rounded-md border border-border bg-surface px-3 text-base text-fg hover:bg-raised"
        aria-label={t("shell.switchWorkspace")}
      >
        <span
          aria-hidden
          className="inline-block h-4 w-4 shrink-0 rounded-sm"
          style={{ background: tenant?.branding.accent }}
        />
        <span className="flex-1 truncate text-left">
          <span className="font-semibold">{tenant?.name}</span>
          <span className="text-muted"> / {workspace?.name}</span>
        </span>
        <CaretUpDown size={18} aria-hidden />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[18rem] rounded-lg border border-border bg-raised p-2 shadow-xl"
        >
          {MOCK_TENANTS.map((tn) => (
            <Menu.Group key={tn.id}>
              <Menu.Label className="flex items-center gap-2 px-2 py-1 text-base font-semibold text-muted">
                <Buildings size={16} aria-hidden />
                {tn.name}
              </Menu.Label>
              {MOCK_WORKSPACES.filter((w) => w.tenantId === tn.id).map((w) => {
                const active = w.id === workspaceId;
                return (
                  <Menu.Item
                    key={w.id}
                    onSelect={() => select(w.id, tn.id, w.name)}
                    className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface"
                  >
                    <span className="flex-1">{w.name}</span>
                    {active ? <Check size={18} aria-hidden /> : null}
                  </Menu.Item>
                );
              })}
            </Menu.Group>
          ))}

          {can("members.view") ? (
            <>
              <Menu.Separator className="my-1 h-px bg-border" />
              <Menu.Item
                onSelect={() => navigate("/members")}
                className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-base text-fg outline-none data-[highlighted]:bg-surface"
              >
                <UsersThree size={18} aria-hidden />
                {t("shell.manageMembers")}
              </Menu.Item>
            </>
          ) : null}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
