import * as React from "react";
import { useAuthStore } from "@/store/authStore";
import { LoginPage } from "./LoginPage";

/** Renders the authenticated shell, or the login screen when anonymous. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  if (status !== "authenticated") return <LoginPage />;
  return <>{children}</>;
}
