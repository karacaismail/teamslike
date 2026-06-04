import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGate } from "./AuthGate";
import { AppShell } from "@/components/shell/AppShell";
import { RouteError } from "@/components/shell/AppErrorBoundary";
import { DOMAINS } from "@/data/domains";

// Route-level code splitting: each page/feature slice becomes its own chunk.
const DashboardPage = lazy(() =>
  import("./DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const DomainPage = lazy(() =>
  import("./DomainPage").then((m) => ({ default: m.DomainPage })),
);
const MembersPage = lazy(() =>
  import("./MembersPage").then((m) => ({ default: m.MembersPage })),
);
const MessagingPage = lazy(() =>
  import("@/features/messaging/MessagingPage").then((m) => ({ default: m.MessagingPage })),
);
const MeetingsPage = lazy(() =>
  import("@/features/meetings/MeetingsPage").then((m) => ({ default: m.MeetingsPage })),
);
const IntelligencePage = lazy(() =>
  import("@/features/intelligence/IntelligencePage").then((m) => ({ default: m.IntelligencePage })),
);
const TelephonyPage = lazy(() =>
  import("@/features/telephony/PhoneLayout").then((m) => ({ default: m.PhoneLayout })),
);
const WebinarPage = lazy(() =>
  import("@/features/webinar/WebinarPage").then((m) => ({ default: m.WebinarPage })),
);
const SupportLayout = lazy(() =>
  import("@/features/support/SupportLayout").then((m) => ({ default: m.SupportLayout })),
);
const SchedulingPage = lazy(() =>
  import("@/features/scheduling/SchedulingPage").then((m) => ({ default: m.SchedulingPage })),
);
const DocsPage = lazy(() =>
  import("@/features/docs/DocsPage").then((m) => ({ default: m.DocsPage })),
);
const AiCanvasPage = lazy(() =>
  import("@/features/canvas/CanvasPage").then((m) => ({ default: m.AiCanvasPage })),
);
const AdminConsole = lazy(() =>
  import("@/features/admin/AdminConsole").then((m) => ({ default: m.AdminConsole })),
);
const ProfilePage = lazy(() =>
  import("@/features/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);

// Implemented domains ship their full feature slice; others use the generic
// preview page until their phase lands.
const IMPLEMENTED = new Set(["dashboard", "messaging", "meetings", "intelligence", "telephony", "webinar", "support", "scheduling", "docs", "canvas", "admin"]);
const domainChildren = DOMAINS.filter((d) => !IMPLEMENTED.has(d.key)).map((d) => ({
  path: d.path.replace(/^\//, ""),
  element: <DomainPage domainKey={d.key} />,
}));

// GitHub Pages serves under /<repo>/; basename keeps client routes correct.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export const router = createBrowserRouter(
  [
  {
    path: "/",
    element: (
      <AuthGate>
        <AppShell />
      </AuthGate>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "messaging", element: <MessagingPage /> },
      { path: "meetings", element: <MeetingsPage /> },
      { path: "intelligence", element: <IntelligencePage /> },
      { path: "telephony", element: <TelephonyPage /> },
      { path: "webinar", element: <WebinarPage /> },
      { path: "support", element: <SupportLayout /> },
      { path: "scheduling", element: <SchedulingPage /> },
      { path: "docs", element: <DocsPage /> },
      { path: "canvas", element: <AiCanvasPage /> },
      { path: "admin", element: <AdminConsole /> },
      { path: "members", element: <MembersPage /> },
      { path: "profile", element: <ProfilePage /> },
      ...domainChildren,
    ],
  },
  ],
  { basename },
);
