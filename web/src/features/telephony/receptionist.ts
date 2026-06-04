import type {
  CaptureField,
  ReceptionistActionKind,
  ReceptionistConfig,
  ReceptionistIntent,
} from "./types";

/**
 * Pure AI-receptionist helpers (intent matching, greeting selection, capture).
 * Framework-free → unit-testable; a FastAPI/NLU backend would compute the same.
 */

/** Lowercase + strip punctuation → non-empty token list (Unicode-aware). */
function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Match a caller utterance to the best intent by phrase token overlap.
 * A phrase scores only when ALL of its tokens appear in the utterance; longer
 * phrases weigh more (token count). Ties resolve to the earliest intent.
 * Returns null when nothing overlaps.
 */
export function matchIntent(text: string, intents: ReceptionistIntent[]): ReceptionistIntent | null {
  const utter = new Set(tokens(text));
  let best: ReceptionistIntent | null = null;
  let bestScore = 0;
  for (const intent of intents) {
    let score = 0;
    for (const phrase of intent.phrases) {
      const pt = tokens(phrase);
      if (pt.length > 0 && pt.every((t) => utter.has(t))) score += pt.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best;
}

/** Greeting for the current open/after-hours state. */
export function receptionistGreeting(config: ReceptionistConfig, withinHours: boolean): string {
  return withinHours ? config.greeting : config.afterHoursGreeting;
}

/** Resolve the action for a matched intent, falling back to the config default. */
export function resolveAction(
  config: ReceptionistConfig,
  intent: ReceptionistIntent | null,
): ReceptionistActionKind {
  return intent ? intent.action : config.fallback;
}

/** Whether all required capture fields are present and non-empty. */
export function captureComplete(
  required: CaptureField[],
  captured: { name?: string; phone?: string; reason?: string },
): boolean {
  return required.every((f) => Boolean(captured[f] && captured[f]!.trim()));
}

/**
 * Demo reply text for a recognized intent/action. FAQ answers come from the
 * intent itself; routing actions get a short confirmation line. Used to seed
 * the mock live-session transcript (demo content; UI chrome is i18n'd).
 */
export function receptionistReply(
  intent: ReceptionistIntent | null,
  action: ReceptionistActionKind,
): string {
  if (intent && action === "answer_faq" && intent.answer) return intent.answer;
  switch (action) {
    case "route_queue":
      return "Connecting you to the right team now.";
    case "route_extension":
      return "Transferring you to the extension.";
    case "book":
      return "I can book that — may I take your name and number?";
    case "voicemail":
      return "I'll take a message and the team will call you back.";
    case "human":
      return "Let me bring in a teammate to help.";
    case "answer_faq":
      return "Here's what I can share on that.";
    default:
      return "How can I help you today?";
  }
}
