import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { LoginPage } from "@/routes/LoginPage";
import { AppShell } from "@/components/shell/AppShell";

describe("AURA Phase 1 shell — smoke", () => {
  it("shows the login screen when anonymous", () => {
    render(<LoginPage />);
    expect(screen.getByText("Sign in to AURA")).toBeInTheDocument();
  });

  it("mounts the authenticated shell with RBAC nav, command palette and copilot", () => {
    useAuthStore.getState().login("ismail@aura.dev");
    // Data router (createMemoryRouter) so the shell's useBlocker-based
    // UnsavedNavGuard (J6) has the router context it requires.
    const router = createMemoryRouter([
      { path: "/", element: <AppShell />, children: [{ index: true, element: <div /> }] },
    ]);
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Messaging")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByLabelText("Open command palette")).toBeInTheDocument();

    // Copilot dock is closed by default now (ui.md §4) — it opens from the TopBar.
    expect(screen.queryByText(/workspace copilot/i)).toBeNull();
    fireEvent.click(screen.getByLabelText("Copilot"));
    expect(screen.getByText(/workspace copilot/i)).toBeInTheDocument();
  });
});
