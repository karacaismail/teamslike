import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@/i18n";
import i18n from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { useDocsStore } from "@/features/docs/docsStore";
import { TableGridView } from "@/features/docs/components/TableGridView";

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});
beforeEach(() => useDocsStore.getState().reset());

describe("docs TableGrid store (Faz 9)", () => {
  it("editCell updates a cell", () => {
    useDocsStore.getState().editCell("tbl_launch", "tr1", "c_qty", "10");
    const row = useDocsStore.getState().tables[0].rows.find((r) => r.id === "tr1")!;
    expect(row.cells.c_qty).toBe("10");
  });
  it("addTableRow / addTableColumn grow the table", () => {
    const before = useDocsStore.getState().tables[0];
    useDocsStore.getState().addTableRow("tbl_launch");
    useDocsStore.getState().addTableColumn("tbl_launch", "Notes", "text");
    const after = useDocsStore.getState().tables[0];
    expect(after.rows.length).toBe(before.rows.length + 1);
    expect(after.columns.length).toBe(before.columns.length + 1);
  });
});

describe("TableGridView render", () => {
  it("renders the seeded table with the computed formula column", () => {
    render(<TableGridView />);
    expect(screen.getByText("Launch budget")).toBeInTheDocument();
    expect(screen.getByText("3600")).toBeInTheDocument(); // Qty 3 * Price 1200
  });
});

describe("docs TableGrid delete actions (Faz 9)", () => {
  it("deleteTableRow and deleteTableColumn shrink the table", () => {
    const before = useDocsStore.getState().tables[0];
    useDocsStore.getState().deleteTableRow("tbl_launch", before.rows[0].id);
    useDocsStore.getState().deleteTableColumn("tbl_launch", before.columns[0].id);
    const after = useDocsStore.getState().tables[0];
    expect(after.rows.length).toBe(before.rows.length - 1);
    expect(after.columns.length).toBe(before.columns.length - 1);
  });
});
