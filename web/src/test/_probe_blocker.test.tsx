import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, Link } from "react-router-dom";
import "@/i18n";
import i18n from "@/i18n";
import { useUIStore } from "@/store/uiStore";
import { UnsavedNavGuard } from "@/components/shell/UnsavedNavGuard";

function Page() {
  return (
    <>
      <UnsavedNavGuard />
      <Link to="/next">go</Link>
    </>
  );
}
const mkRouter = () =>
  createMemoryRouter([
    { path: "/", element: <Page /> },
    { path: "/next", element: <div>next page</div> },
  ]);

beforeAll(async () => {
  await i18n.changeLanguage("en");
});
beforeEach(() => useUIStore.getState().setDirty("composer", false));

describe("UnsavedNavGuard — in-app nav blocking (J6)", () => {
  it("blocks an in-app route change when a surface is dirty", () => {
    useUIStore.getState().setDirty("composer", true);
    render(<RouterProvider router={mkRouter()} />);
    fireEvent.click(screen.getByText("go"));
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument(); // confirm dialog
    fireEvent.click(screen.getByText("Stay"));
    expect(screen.queryByText("next page")).not.toBeInTheDocument();
  });

  it("allows navigation when nothing is dirty", () => {
    render(<RouterProvider router={mkRouter()} />);
    fireEvent.click(screen.getByText("go"));
    expect(screen.getByText("next page")).toBeInTheDocument();
  });
});
