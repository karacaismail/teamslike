import type { Board, Clip, DataTable, DocComment, Doc, Workflow } from "./types";

export const DOCS: Doc[] = [
  {
    id: "doc_launch",
    workspaceId: "ws_core",
    title: "Q3 Launch Plan",
    blocks: [
      { id: "b1", type: "heading", content: "Q3 Launch Plan" },
      { id: "b2", type: "text", content: "Owner: You · Target: go/no-go at 15:00." },
      { id: "b3", type: "todo", content: "Finalize load-test report", checked: true },
      { id: "b4", type: "todo", content: "Publish dark-mode tokens", checked: true },
      { id: "b5", type: "todo", content: "Land pricing page by 14:00", checked: false },
      { id: "b6", type: "divider", content: "" },
      { id: "b7", type: "text", content: "Risks: pricing page pending." },
    ],
  },
  {
    id: "doc_onboarding",
    workspaceId: "ws_core",
    title: "Onboarding runbook",
    blocks: [
      { id: "o1", type: "heading", content: "Onboarding runbook" },
      { id: "o2", type: "text", content: "Steps for a new teammate's first week." },
      { id: "o3", type: "todo", content: "Create accounts & access", checked: false },
      { id: "o4", type: "todo", content: "Pair on the codebase tour", checked: false },
    ],
  },
  {
    id: "doc_growth",
    workspaceId: "ws_growth",
    title: "Growth experiments",
    blocks: [
      { id: "g1", type: "heading", content: "Growth experiments" },
      { id: "g2", type: "text", content: "Q3 experiment backlog for the Growth workspace." },
      { id: "g3", type: "todo", content: "Ship referral A/B test", checked: false },
    ],
  },
];

export const BOARD: Board = {
  id: "bd_launch",
  title: "Launch board",
  columns: [
    { id: "col_todo", title: "To do" },
    { id: "col_doing", title: "In progress" },
    { id: "col_done", title: "Done" },
  ],
  cards: [
    { id: "cd1", title: "Pricing page", columnId: "col_doing", assigneeId: "usr_2" },
    { id: "cd2", title: "Launch comms", columnId: "col_todo", assigneeId: "usr_4" },
    { id: "cd3", title: "Load-test report", columnId: "col_done", assigneeId: "usr_3" },
    { id: "cd4", title: "Dark-mode tokens", columnId: "col_done", assigneeId: "usr_4" },
  ],
};

export const WORKFLOWS: Workflow[] = [
  {
    id: "wf_onboard",
    name: "New customer onboarding",
    trigger: "message",
    steps: [
      { id: "s1", kind: "send_message", value: "Welcome! Here's your getting-started guide." },
      { id: "s2", kind: "assign", value: "usr_1" },
      { id: "s3", kind: "add_label", value: "onboarding" },
    ],
  },
  {
    id: "wf_standup",
    name: "Daily standup reminder",
    trigger: "schedule",
    steps: [
      { id: "s1", kind: "send_message", value: "Standup in 5 minutes — post your update." },
      { id: "s2", kind: "wait", value: "300" },
    ],
  },
];

export const CLIPS: Clip[] = [
  {
    id: "clip_demo",
    title: "Feature walkthrough",
    authorId: "usr_1",
    durationSec: 142,
    transcript:
      "Here's the new intelligence layer. First, it transcribes every call. Then it surfaces action items automatically. We need to ship the export fix this week. Follow up with design on the empty states.",
    views: 38,
    recordMode: "screen_cam",
    privacy: "workspace",
    summary: "Walkthrough of the intelligence layer: live transcription and automatic action items.",
    chapters: [
      { atSec: 0, title: "Intro" },
      { atSec: 40, title: "Transcription" },
      { atSec: 95, title: "Action items" },
    ],
    tasks: ["Ship the export fix this week", "Follow up with design on empty states"],
    ctaLabel: "Open the dashboard",
    ctaUrl: "https://aura.dev/dashboard",
    ctaClicks: 9,
    comments: [
      { id: "cc_1", authorId: "usr_2", atSec: 42, body: "Can we translate the transcript live too?" },
      { id: "cc_2", authorId: "usr_3", atSec: 96, body: "Love the auto action items." },
    ],
    reactions: [
      { emoji: "🔥", count: 4 },
      { emoji: "👍", count: 7 },
    ],
    completionRate: 0.72,
    hashtags: ["launch", "intelligence"],
  },
  {
    id: "clip_retro",
    title: "Sprint retro recap",
    authorId: "usr_2",
    durationSec: 95,
    transcript: "Three wins this sprint. Two follow-ups for next week. We should automate the release notes.",
    views: 17,
    recordMode: "screen",
    privacy: "link",
    completionRate: 0.58,
    hashtags: ["retro"],
    comments: [],
    reactions: [],
  },
];

export const MEMBER_NAMES: Record<string, string> = {
  usr_1: "You",
  usr_2: "Aylin Demir",
  usr_3: "Sora Kim",
  usr_4: "Devin Roy",
};

/* Relational table seed (TableGrid — Faz 9). Owner cells are member ids. */
export const TABLES: DataTable[] = [
  {
    id: "tbl_launch",
    title: "Launch budget",
    columns: [
      { id: "c_item", name: "Item", type: "text" },
      { id: "c_owner", name: "Owner", type: "person" },
      { id: "c_qty", name: "Qty", type: "number" },
      { id: "c_price", name: "Price", type: "number" },
      { id: "c_total", name: "Total", type: "formula", formula: "Qty * Price" },
      { id: "c_status", name: "Status", type: "select", options: ["todo", "doing", "done"] },
      { id: "c_due", name: "Due", type: "date" },
    ],
    rows: [
      { id: "tr1", cells: { c_item: "Ad spend", c_owner: "usr_2", c_qty: "3", c_price: "1200", c_status: "doing", c_due: "2026-06-15" } },
      { id: "tr2", cells: { c_item: "Event swag", c_owner: "usr_4", c_qty: "200", c_price: "8", c_status: "todo", c_due: "2026-06-20" } },
      { id: "tr3", cells: { c_item: "Venue", c_owner: "usr_1", c_qty: "1", c_price: "5000", c_status: "done", c_due: "2026-06-10" } },
    ],
  },
];

/* Inline doc comments seed (collaboration — Faz 9). */
export const DOC_COMMENTS: DocComment[] = [
  { id: "cm1", docId: "doc_launch", blockId: "b5", authorId: "usr_2", body: "Can we confirm the 14:00 cutoff with sales?", atMin: 22 },
  { id: "cm2", docId: "doc_launch", blockId: "b2", authorId: "usr_4", body: "Owner line looks good.", atMin: 8, resolved: true },
];
