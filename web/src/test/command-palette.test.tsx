import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import i18n from "@/i18n";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { CommandPalette } from "@/components/shell/CommandPalette";

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});
beforeEach(() => useUIStore.getState().setPaletteOpen(true));

describe("command palette global search (A2)", () => {
  it("surfaces a member result when typing a name", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommandPalette />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "ismail" } });
    expect(screen.getByText("Results")).toBeInTheDocument();
    expect(screen.getAllByText(/Ismail/i).length).toBeGreaterThan(0);
  });

  it("surfaces a domain result when typing a domain key", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommandPalette />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "telephony" } });
    expect(screen.getByText("Results")).toBeInTheDocument();
  });
});
