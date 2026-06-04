import { useTranslation } from "react-i18next";
import { Forbidden } from "@/components/ui/Forbidden";
import { UserPlus, Prohibit } from "@/lib/icons";
import { TEAM } from "@/data/team";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { Avatar } from "@/components/ui/Avatar";
import { PresenceDot } from "@/components/ui/PresenceDot";
import { Badge, Button, Card } from "@/components/ui/primitives";
import type { RoleKey } from "@/types/domain";

const roleTone: Record<RoleKey, "accent" | "neutral" | "warning"> = {
  owner: "accent",
  admin: "accent",
  member: "neutral",
  guest: "warning",
};

export function MembersPage() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.can);
  const push = useToastStore((s) => s.push);

  if (!can("members.view")) {
    return <Forbidden />;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-fg">{t("members.title")}</h1>
          <p className="mt-1 text-base text-muted">
            {t("members.count", { n: TEAM.length })}
          </p>
        </div>
        {can("members.invite") ? (
          <Button onClick={() => push({ title: t("members.inviteSent"), tone: "positive" })}>
            <UserPlus size={20} aria-hidden />
            {t("members.invite")}
          </Button>
        ) : null}
      </div>

      <Card className="mt-6 p-0">
        <ul className="divide-y divide-[var(--border)]">
          {TEAM.map((m) => (
            <li key={m.id} className="flex items-center gap-4 p-4">
              <span className="relative inline-block">
                <Avatar name={m.name} />
                <PresenceDot
                  presence={m.presence}
                  className="absolute -bottom-0.5 -right-0.5"
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-semibold text-fg">{m.name}</div>
                <div className="truncate text-base text-muted">{m.title}</div>
              </div>
              <div className="hidden text-base text-muted sm:block">{m.email}</div>
              <span className="text-base text-muted">{t(`presence.${m.presence}`)}</span>
              <Badge tone={roleTone[m.role]}>{t(`role.${m.role}`)}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
