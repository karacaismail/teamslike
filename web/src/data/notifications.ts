import type { ActivityItem, AppNotification } from "@/types/domain";

export const NOTIFICATIONS: AppNotification[] = [
  // href = deep-link target (J3). Messaging targets reuse the J2 URL state (?c=&t=).
  { id: "n1", kind: "mention", actor: "Defne Yıldız", target: "#product / Q3 launch", tMinutes: 4, read: false, href: "/messaging?c=ch_product&t=tp_q3" },
  { id: "n2", kind: "assigned", actor: "Marco Rossi", target: "Spec review", tMinutes: 26, read: false, href: "/docs" },
  { id: "n3", kind: "meeting", actor: "Aylin Çetin", target: "Design sync 15:00", tMinutes: 52, read: false, href: "/meetings" },
  { id: "n4", kind: "agent", actor: "Copilot", target: "Weekly digest", tMinutes: 90, read: true, href: "/intelligence" },
  { id: "n5", kind: "member", actor: "Sara Lindqvist", target: "Core Team", tMinutes: 180, read: true, href: "/members" },
];

export const ACTIVITY: ActivityItem[] = [
  { id: "a1", kind: "posted", actor: "Defne Yıldız", target: "#product", tMinutes: 3, href: "/messaging?c=ch_product&t=tp_q3" },
  { id: "a2", kind: "scheduled", actor: "Aylin Çetin", target: "Design sync", tMinutes: 18, href: "/meetings" },
  { id: "a3", kind: "resolved", actor: "Tom Becker", target: "Ticket #2381", tMinutes: 41, href: "/support" },
  { id: "a4", kind: "created", actor: "Marco Rossi", target: "RFC: realtime layer", tMinutes: 75, href: "/messaging?c=ch_eng&t=tp_rfc" },
  { id: "a5", kind: "joined", actor: "Sara Lindqvist", target: "Core Team", tMinutes: 182, href: "/members" },
];
