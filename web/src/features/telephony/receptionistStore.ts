import { create } from "zustand";
import { RECEPTIONIST } from "./data";
import { matchIntent, receptionistReply, resolveAction } from "./receptionist";
import type {
  CaptureField,
  ReceptionistConfig,
  ReceptionistIntent,
  ReceptionistSession,
  ReceptionistTurn,
} from "./types";

let turnSeq = 0;
const mkTurn = (who: "caller" | "ai", text: string): ReceptionistTurn => ({
  id: `rt_${++turnSeq}`,
  who,
  text,
});

let intentSeq = 0;

const cloneConfig = (): ReceptionistConfig => ({
  ...RECEPTIONIST,
  captureFields: [...RECEPTIONIST.captureFields],
  intents: RECEPTIONIST.intents.map((i) => ({ ...i, phrases: [...i.phrases] })),
});

const emptySession = (): ReceptionistSession => ({ turns: [], captured: {}, done: false });

interface ReceptionistState {
  config: ReceptionistConfig;
  session: ReceptionistSession;

  toggleEnabled: () => void;
  setGreeting: (greeting: string) => void;
  setAfterHoursGreeting: (greeting: string) => void;
  toggleSmsFollowUp: () => void;
  toggleCaptureField: (field: CaptureField) => void;
  addIntent: (intent: Omit<ReceptionistIntent, "id">) => void;
  removeIntent: (id: string) => void;
  /** Advance the mock live session with one caller utterance. */
  simulateCaller: (text: string) => void;
  resetSession: () => void;
}

export const useReceptionistStore = create<ReceptionistState>((set) => ({
  config: cloneConfig(),
  session: emptySession(),

  toggleEnabled: () => set((s) => ({ config: { ...s.config, enabled: !s.config.enabled } })),
  setGreeting: (greeting) => set((s) => ({ config: { ...s.config, greeting } })),
  setAfterHoursGreeting: (greeting) =>
    set((s) => ({ config: { ...s.config, afterHoursGreeting: greeting } })),
  toggleSmsFollowUp: () => set((s) => ({ config: { ...s.config, smsFollowUp: !s.config.smsFollowUp } })),
  toggleCaptureField: (field) =>
    set((s) => ({
      config: {
        ...s.config,
        captureFields: s.config.captureFields.includes(field)
          ? s.config.captureFields.filter((f) => f !== field)
          : [...s.config.captureFields, field],
      },
    })),
  addIntent: (intent) =>
    set((s) => ({
      config: {
        ...s.config,
        intents: [...s.config.intents, { ...intent, id: `int_new_${++intentSeq}` }],
      },
    })),
  removeIntent: (id) =>
    set((s) => ({ config: { ...s.config, intents: s.config.intents.filter((i) => i.id !== id) } })),

  simulateCaller: (text) =>
    set((s) => {
      const intent = matchIntent(text, s.config.intents);
      const action = resolveAction(s.config, intent);
      const reply = receptionistReply(intent, action);
      const turns = [...s.session.turns, mkTurn("caller", text), mkTurn("ai", reply)];
      // The receptionist keeps the line open only for FAQ answers; routing/book
      // /human/voicemail conclude the AI's part of the call.
      return {
        session: {
          ...s.session,
          turns,
          detectedIntentId: intent?.id,
          action,
          done: action !== "answer_faq",
        },
      };
    }),
  resetSession: () => set({ session: emptySession() }),
}));
