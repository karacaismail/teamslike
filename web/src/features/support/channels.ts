import type { ChannelConnection, Inbox } from "./types";

/**
 * Channel onboarding helpers (Embedded Signup → Coexistence → live).
 * Coexistence lets a business move a number to the Cloud API without losing
 * the existing WhatsApp Business app. Framework-free → unit-testable.
 */

export interface OnboardingStep {
  /** i18n key suffix for the current step. */
  step: "connect" | "verifying" | "migrating" | "live";
  /** 0..1 progress for a progress bar. */
  progress: number;
}

const STEP: Record<ChannelConnection, OnboardingStep> = {
  disconnected: { step: "connect", progress: 0 },
  pending: { step: "verifying", progress: 0.5 },
  coexistence: { step: "migrating", progress: 0.75 },
  connected: { step: "live", progress: 1 },
};

/** Map a connection state to an onboarding step + progress. */
export function channelOnboardingState(connection: ChannelConnection = "disconnected"): OnboardingStep {
  return STEP[connection];
}

/**
 * Coexistence is offered only for WhatsApp on the Cloud API, once the number is
 * verified (pending) or already running in coexistence/connected mode.
 */
export function canEnableCoexistence(inbox: Inbox): boolean {
  return (
    inbox.channelType === "whatsapp" &&
    inbox.provider === "cloud_api" &&
    inbox.connection !== "disconnected"
  );
}

/** Count inboxes that are live (connected or running coexistence). */
export function connectedCount(inboxes: Inbox[]): number {
  return inboxes.filter((i) => i.connection === "connected" || i.connection === "coexistence").length;
}
