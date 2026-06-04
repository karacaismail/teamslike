import { create } from "zustand";
import { LINES, SMS_THREADS } from "./data";
import { renderTemplate } from "./routing";
import type { ScheduledSms, SmsMedia, SmsMessage, SmsThread } from "./types";

let seq = 0;
const newId = () => `sms_${Date.now()}_${seq++}`;
const LINE_E164 = LINES[0].e164;

const clone = (): SmsThread[] => SMS_THREADS.map((t) => ({ ...t, messages: t.messages.map((m) => ({ ...m })) }));

interface SmsState {
  threads: SmsThread[];
  activeThreadId: string | null;
  scheduled: ScheduledSms[];

  setActiveThread: (id: string) => void;
  send: (threadId: string, body: string) => void;
  sendMedia: (threadId: string, body: string, media: SmsMedia[]) => void;
  sendTemplate: (threadId: string, tpl: string, vars: Record<string, string>) => void;
  receive: (message: SmsMessage) => void;
  markRead: (threadId: string) => void;
  scheduleSms: (threadId: string, body: string, at: number) => void;
  /** Send any scheduled messages now due. */
  flushDue: (now: number) => void;
  reset: () => void;
}

const append = (threads: SmsThread[], threadId: string, msg: SmsMessage): SmsThread[] =>
  threads.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, msg] } : t));

export const useSmsStore = create<SmsState>((set, get) => ({
  threads: clone(),
  activeThreadId: SMS_THREADS[0]?.id ?? null,
  scheduled: [],

  setActiveThread: (id) =>
    set((s) => ({
      activeThreadId: id,
      threads: s.threads.map((t) => (t.id === id ? { ...t, unread: 0 } : t)),
    })),

  send: (threadId, body) =>
    set((s) => ({
      threads: s.threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [
                ...t.messages,
                { id: newId(), threadId, from: LINE_E164, to: t.e164, body, sentAt: Date.now(), outbound: true },
              ],
            }
          : t,
      ),
    })),

  receive: (message) =>
    set((s) => ({
      threads: s.threads.map((t) =>
        t.id === message.threadId
          ? { ...t, messages: [...t.messages, message], unread: t.unread + 1 }
          : t,
      ),
    })),

  sendMedia: (threadId, body, media) =>
    set((s) => {
      const t = s.threads.find((x) => x.id === threadId);
      if (!t) return {};
      return {
        threads: append(s.threads, threadId, {
          id: newId(),
          threadId,
          from: LINE_E164,
          to: t.e164,
          body,
          sentAt: Date.now(),
          outbound: true,
          media,
        }),
      };
    }),

  sendTemplate: (threadId, tpl, vars) => get().send(threadId, renderTemplate(tpl, vars)),

  markRead: (threadId) =>
    set((s) => ({ threads: s.threads.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)) })),

  scheduleSms: (threadId, body, at) =>
    set((s) => ({ scheduled: [...s.scheduled, { id: newId(), threadId, body, at }] })),

  flushDue: (now) =>
    set((s) => {
      const due = s.scheduled.filter((x) => x.at <= now);
      if (due.length === 0) return {};
      let threads = s.threads;
      for (const d of due) {
        const t = threads.find((x) => x.id === d.threadId);
        if (!t) continue;
        threads = append(threads, d.threadId, {
          id: newId(),
          threadId: d.threadId,
          from: LINE_E164,
          to: t.e164,
          body: d.body,
          sentAt: now,
          outbound: true,
        });
      }
      return { threads, scheduled: s.scheduled.filter((x) => x.at > now) };
    }),

  reset: () => set({ threads: clone(), activeThreadId: SMS_THREADS[0]?.id ?? null, scheduled: [] }),
}));
