import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Prohibit, House } from "@/lib/icons";
import { Button, Card } from "@/components/ui/primitives";

/**
 * Shared 403 / no-access surface (J8). Replaces the inlined blocks that
 * dead-ended the user — now it offers a way out (back to the dashboard).
 */
export function Forbidden() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-3xl p-6">
      <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Prohibit size={28} className="text-danger" aria-hidden />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-fg">{t("forbidden.title")}</h1>
          <p className="text-base text-muted">{t("forbidden.body")}</p>
        </div>
        <Button onClick={() => navigate("/dashboard")}>
          <House size={18} aria-hidden /> {t("forbidden.cta")}
        </Button>
      </Card>
    </div>
  );
}
