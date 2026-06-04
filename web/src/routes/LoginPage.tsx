import * as React from "react";
import { useTranslation } from "react-i18next";
import { Sparkle, ArrowRight } from "@/lib/icons";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/primitives";

export function LoginPage() {
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <main className="w-full max-w-md rounded-lg border border-border bg-raised p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Sparkle size={32} weight="fill" className="text-accent" aria-hidden />
          <span className="text-2xl font-bold text-fg">{t("app.name")}</span>
        </div>
        <h1 className="text-2xl font-semibold text-fg">{t("login.title")}</h1>
        <p className="mt-1 text-base text-muted">{t("login.subtitle")}</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-base font-medium text-fg">
              {t("login.email")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.demoEmail")}
              className="h-11 w-full rounded-md border border-border bg-bg px-3 text-base text-fg outline-none placeholder:text-muted"
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            {t("login.continue")}
            <ArrowRight size={20} aria-hidden />
          </Button>
        </form>

        <p className="mt-4 text-base text-muted">{t("login.demoNote")}</p>
      </main>
    </div>
  );
}
