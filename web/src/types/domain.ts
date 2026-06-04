import type { ComponentType } from "react";

/** Loose icon type compatible with Phosphor icon components. */
export type IconType = ComponentType<{
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  className?: string;
  "aria-hidden"?: boolean;
}>;

export type DomainKey =
  | "dashboard"
  | "messaging"
  | "meetings"
  | "intelligence"
  | "telephony"
  | "webinar"
  | "scheduling"
  | "support"
  | "docs"
  | "canvas"
  | "admin";

export interface DomainMeta {
  key: DomainKey;
  path: string;
  labelKey: string;
  descKey: string;
  icon: IconType;
  requires: string;
  phase: number;
}

/* ------------------------------- IAM / RBAC -------------------------------- */
export type RoleKey = "owner" | "admin" | "member" | "guest";
export type Presence = "online" | "away" | "offline";

export interface Principal {
  id: string;
  email: string;
  displayName: string;
  title?: string;
  avatarUrl?: string;
  locale: "en" | "tr";
  role: RoleKey;
  permissions: string[];
}

/* -------------------------------- Tenancy ---------------------------------- */
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  plan: "free" | "business" | "enterprise";
  region: string;
  /** Branding → maps to CSS accent at runtime (light theme). */
  branding: { accent: string };
}

export interface Workspace {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  email: string;
  role: RoleKey;
  presence: Presence;
}

/* ---------------------------- AI Orchestration ----------------------------- */
export interface Command {
  key: string;
  titleKey: string;
  group: "navigate" | "ai" | "action";
  requires?: string;
  to?: string;
  prompt?: string;
  icon: IconType;
}

export type AgentStepStatus = "pending" | "running" | "done";

export interface AgentStep {
  id: string;
  label: string;
  status: AgentStepStatus;
}

export interface CopilotSuggestion {
  label: string;
  prompt: string;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  context?: string;
  /** Visible multi-step agent plan (assistant messages). */
  steps?: AgentStep[];
  /** Follow-up suggestions offered after completion. */
  suggestions?: CopilotSuggestion[];
  streaming?: boolean;
}

/** Concrete (i18n-resolved) agent plan handed to the copilot store. */
export interface AgentPlan {
  steps: string[];
  answer: string;
  suggestions: CopilotSuggestion[];
}

/* ----------------------------- Notifications ------------------------------- */
export interface AppNotification {
  id: string;
  kind: "mention" | "assigned" | "meeting" | "agent" | "member";
  actor: string;
  target: string;
  /** relative-time key + amount, resolved in UI */
  tMinutes: number;
  read: boolean;
  /** Deep-link path the notification points at (J3); clicking navigates here. */
  href?: string;
}

export interface ActivityItem {
  id: string;
  kind: "posted" | "scheduled" | "resolved" | "created" | "joined";
  actor: string;
  target: string;
  tMinutes: number;
  /** Deep-link target (J3); clicking the activity row navigates here. */
  href?: string;
}
