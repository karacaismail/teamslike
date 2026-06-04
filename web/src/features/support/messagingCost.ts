/**
 * WhatsApp / business-messaging cost engine (Chatwoot-class omnichannel parity).
 * Models the conversation-window + per-category rate card so the UI can show a
 * predictable bill — the differentiator vs per-resolution AI pricing.
 * Framework-free → unit-testable; the backend would compute the same.
 *
 * Rates are the Meta TR rate card effective 2026-04-01 (USD); a BSP markup would
 * be layered on top by the backend. Numbers here are illustrative seed data.
 */

export type MessageCategory = "marketing" | "utility" | "authentication" | "service";

/** Customer-service window: 24h, reopened by each inbound customer message. */
export const CSW_MIN = 24 * 60;
/** Free entry-point window (click-to-WhatsApp ad / FB): 72h, all messages free. */
export const FREE_ENTRY_MIN = 72 * 60;

export interface WindowState {
  open: boolean;
  remainingMin: number;
}

/** Is the 24h service window still open, and for how long? */
export function windowState(lastInboundMin: number, nowMin: number, windowMin = CSW_MIN): WindowState {
  const elapsed = Math.max(0, nowMin - lastInboundMin);
  const remainingMin = Math.max(0, windowMin - elapsed);
  return { open: remainingMin > 0, remainingMin };
}

export interface BillingContext {
  category: MessageCategory;
  withinWindow: boolean; // inside the 24h CSW
  freeEntryPoint?: boolean; // inside the 72h free entry window
}

/**
 * Whether an outbound message is billable.
 * - free entry point → always free
 * - service (free-form) → only valid inside the window, and free there
 * - utility → free inside the window (TR Apr-2026 rule), billed outside
 * - marketing / authentication → always billed
 */
export function messageBillable(ctx: BillingContext): boolean {
  if (ctx.freeEntryPoint) return false;
  switch (ctx.category) {
    case "service":
      return false;
    case "utility":
      return !ctx.withinWindow;
    case "marketing":
    case "authentication":
      return true;
  }
}

/** Per-message category rates (USD) by region. */
export const RATE_CARD: Record<string, Record<MessageCategory, number>> = {
  TR: { marketing: 0.0109, utility: 0.0009, authentication: 0.0009, service: 0 },
  US: { marketing: 0.025, utility: 0.004, authentication: 0.0135, service: 0 },
  default: { marketing: 0.02, utility: 0.003, authentication: 0.01, service: 0 },
};

export type VolumeTier = "standard" | "growth" | "scale";

/** Volume-tier discount multiplier (more volume → cheaper per message). */
export function volumeTier(monthlyVolume: number): { tier: VolumeTier; multiplier: number } {
  if (monthlyVolume >= 1_000_000) return { tier: "scale", multiplier: 0.8 };
  if (monthlyVolume >= 250_000) return { tier: "growth", multiplier: 0.9 };
  return { tier: "standard", multiplier: 1 };
}

const rateFor = (region: string, category: MessageCategory): number =>
  (RATE_CARD[region] ?? RATE_CARD.default)[category];

/** Cost of one message (USD, 4dp); 0 when not billable. */
export function messageCost(ctx: BillingContext, region = "TR", monthlyVolume = 0): number {
  if (!messageBillable(ctx)) return 0;
  const base = rateFor(region, ctx.category);
  const { multiplier } = volumeTier(monthlyVolume);
  return Math.round(base * multiplier * 10_000) / 10_000;
}

/** Estimate a month's spend; the volume tier is derived from the message count. */
export function monthlyEstimate(messages: BillingContext[], region = "TR"): number {
  const volume = messages.length;
  const total = messages.reduce((sum, m) => sum + messageCost(m, region, volume), 0);
  return Math.round(total * 100) / 100;
}
