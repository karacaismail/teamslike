import type { CanvasDoc, CanvasPrompt } from "./types";

/** Mock collaborators (multiplayer presence demo). */
export const CANVAS_COLLABORATORS = ["İsmail Karaca", "Defne Yıldız", "Marco Rossi"];

/**
 * Prompt library — each entry maps trigger keywords to a block template.
 * `runPrompt` matches free text to the best entry by keyword overlap.
 */
export const CANVAS_PROMPTS: CanvasPrompt[] = [
  { id: "p_summary", label: "Summarize this week across the workspace", keywords: ["summary", "summarize", "week", "recap"], kind: "summary", sources: ["meetings", "messaging", "calling"] },
  { id: "p_actions", label: "Extract action items from meetings", keywords: ["action", "items", "tasks", "todo", "follow up"], kind: "actions", sources: ["meetings", "intelligence"] },
  { id: "p_metrics", label: "Show support & calling KPIs", keywords: ["metrics", "kpi", "numbers", "stats", "performance"], kind: "metrics", sources: ["support", "calling"] },
  { id: "p_table", label: "Compare open conversations by channel", keywords: ["compare", "table", "channels", "breakdown"], kind: "table", sources: ["support"] },
  { id: "p_checklist", label: "Launch readiness checklist", keywords: ["launch", "readiness", "checklist", "release"], kind: "checklist", sources: ["docs", "meetings"] },
];

export const CANVAS_DOC: CanvasDoc = {
  id: "canvas_1",
  title: "Workspace pulse",
  collaborators: CANVAS_COLLABORATORS,
  updatedAt: Date.now(),
  blocks: [
    {
      id: "cb_seed_summary",
      kind: "summary",
      title: "This week, synthesized",
      sources: ["meetings", "messaging", "calling"],
      body: "32 meetings (18h), 4 escalations resolved, call SLA at 94%. Product launch is the dominant thread; two risks flagged in #product need owners.",
    },
    {
      id: "cb_seed_actions",
      kind: "actions",
      title: "Action items",
      sources: ["meetings", "intelligence"],
      items: [
        { id: "ci_1", text: "Assign owners to the two launch risks", done: false },
        { id: "ci_2", text: "Confirm pricing page copy with Marketing", done: true },
        { id: "ci_3", text: "Schedule the go/no-go review", done: false },
      ],
    },
  ],
};
