import { useTranslation } from "react-i18next";
import { Forbidden } from "@/components/ui/Forbidden";
import { Prohibit } from "@/lib/icons";
import { useAuthStore } from "@/store/authStore";
import { useMeetingStore } from "./store";
import { MeetingsLanding } from "./components/MeetingsLanding";
import { PreJoin } from "./components/PreJoin";
import { MeetingRoom } from "./components/MeetingRoom";
import { Card } from "@/components/ui/primitives";

export function MeetingsPage() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.can);
  const phase = useMeetingStore((s) => s.phase);

  if (!can("meetings.view")) {
    return <Forbidden />;
  }

  if (phase === "idle") return <MeetingsLanding />;

  // Meeting stage is scoped to the dark token palette (AAA on dark).
  return (
    <div data-theme="dark" className="h-full bg-bg">
      {phase === "prejoin" ? <PreJoin /> : <MeetingRoom />}
    </div>
  );
}
