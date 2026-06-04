import type { TeamMember } from "@/types/domain";

/** Rich dummy team for Tenancy / members & presence simulation. */
export const TEAM: TeamMember[] = [
  {
    id: "usr_1",
    name: "Ismail K.",
    title: "Founder",
    email: "ismail@aura.dev",
    role: "owner",
    presence: "online",
  },
  {
    id: "usr_2",
    name: "Defne Yıldız",
    title: "Product Lead",
    email: "defne@aura.dev",
    role: "admin",
    presence: "online",
  },
  {
    id: "usr_3",
    name: "Marco Rossi",
    title: "Staff Engineer",
    email: "marco@aura.dev",
    role: "member",
    presence: "away",
  },
  {
    id: "usr_4",
    name: "Aylin Çetin",
    title: "Design Systems",
    email: "aylin@aura.dev",
    role: "member",
    presence: "online",
  },
  {
    id: "usr_5",
    name: "Tom Becker",
    title: "Support Lead",
    email: "tom@aura.dev",
    role: "member",
    presence: "offline",
  },
  {
    id: "usr_6",
    name: "Sara Lindqvist",
    title: "Localization",
    email: "sara@aura.dev",
    role: "guest",
    presence: "away",
  },
];
