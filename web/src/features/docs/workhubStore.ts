import { create } from "zustand";
import type { ApprovalRequest, FormDef, FormResponse, Shift } from "./types";

let seq = 0;
const uid = (p: string) => `${p}_${Date.now()}_${seq++}`;

/** Acting user (would come from auth/session on the real backend). */
const SELF_ID = "usr_1";

const SEED_APPROVALS: ApprovalRequest[] = [
  { id: "ap1", title: "Q3 marketing budget", requesterId: "usr_2", approverId: SELF_ID, status: "pending", createdMin: 35 },
  { id: "ap2", title: "New hire offer — backend", requesterId: "usr_3", approverId: SELF_ID, status: "pending", createdMin: 120 },
  { id: "ap3", title: "Conference travel", requesterId: "usr_4", approverId: SELF_ID, status: "approved", createdMin: 1440 },
];

const SEED_SHIFTS: Shift[] = [
  { id: "sh1", userId: SELF_ID, userName: "Ismail K.", day: 1, startMin: 540, endMin: 1020, role: "Support" },
  { id: "sh2", userId: SELF_ID, userName: "Ismail K.", day: 2, startMin: 540, endMin: 1020, role: "Support" },
  { id: "sh3", userId: "usr_2", userName: "Defne Yıldız", day: 1, startMin: 600, endMin: 1080, role: "Sales" },
  { id: "sh4", userId: "", userName: "", day: 3, startMin: 540, endMin: 900, role: "Support", open: true },
];

const SEED_FORMS: FormDef[] = [
  {
    id: "fm_lunch",
    title: "Team lunch",
    question: "Where should we go?",
    options: [
      { id: "o1", text: "Italian" },
      { id: "o2", text: "Sushi" },
      { id: "o3", text: "Kebab" },
    ],
  },
];

const SEED_RESPONSES: FormResponse[] = [
  { id: "fr1", formId: "fm_lunch", optionId: "o2", responderId: "usr_2" },
  { id: "fr2", formId: "fm_lunch", optionId: "o2", responderId: "usr_3" },
  { id: "fr3", formId: "fm_lunch", optionId: "o1", responderId: "usr_4" },
];

interface WorkhubState {
  approvals: ApprovalRequest[];
  shifts: Shift[];
  forms: FormDef[];
  responses: FormResponse[];

  requestApproval: (title: string) => void;
  decideApproval: (id: string, status: "approved" | "rejected") => void;
  claimShift: (id: string) => void;
  respondForm: (formId: string, optionId: string) => void;
  reset: () => void;
}

const clone = <T,>(rows: T[]): T[] => rows.map((r) => ({ ...r }));

export const useWorkhubStore = create<WorkhubState>((set) => ({
  approvals: clone(SEED_APPROVALS),
  shifts: clone(SEED_SHIFTS),
  forms: clone(SEED_FORMS),
  responses: clone(SEED_RESPONSES),

  requestApproval: (title) =>
    set((s) => ({
      approvals: [
        { id: uid("ap"), title, requesterId: SELF_ID, approverId: "usr_2", status: "pending", createdMin: 0 },
        ...s.approvals,
      ],
    })),

  decideApproval: (id, status) =>
    set((s) => ({ approvals: s.approvals.map((a) => (a.id === id ? { ...a, status } : a)) })),

  claimShift: (id) =>
    set((s) => ({
      shifts: s.shifts.map((sh) => (sh.id === id ? { ...sh, userId: SELF_ID, userName: "Ismail K.", open: false } : sh)),
    })),

  respondForm: (formId, optionId) =>
    set((s) => ({
      responses: [...s.responses, { id: uid("fr"), formId, optionId, responderId: SELF_ID }],
    })),

  reset: () =>
    set({
      approvals: clone(SEED_APPROVALS),
      shifts: clone(SEED_SHIFTS),
      forms: clone(SEED_FORMS),
      responses: clone(SEED_RESPONSES),
    }),
}));

export const WORKHUB_SELF_ID = SELF_ID;
