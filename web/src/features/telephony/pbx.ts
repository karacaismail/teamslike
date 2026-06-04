import type { BusinessHours, CallQueue, Delegate, HuntGroup, HuntMember, IVRMenu, IVROption, MonitorMode, QueueAgent, QueuedCall } from "./types";

/**
 * Pure PBX-domain helpers (call distribution, business hours, IVR routing).
 * Framework-free → unit-testable; the FastAPI backend would compute the same.
 */

/**
 * Choose which agent to ring for a queued call.
 * - `simultaneous`: first available (the caller rings all; pick a representative).
 * - `round_robin`: next available after `lastIndex` (wraps, skips unavailable).
 * - `longest_idle`: available agent idle the longest.
 */
export function pickAgent(queue: CallQueue, lastIndex = -1): QueueAgent | null {
  const agents = queue.agents;
  if (agents.length === 0) return null;

  if (queue.strategy === "longest_idle") {
    const available = agents.filter((a) => a.available);
    if (available.length === 0) return null;
    return available.reduce((max, a) => (a.idleSec > max.idleSec ? a : max));
  }

  if (queue.strategy === "simultaneous" || queue.strategy === "sequential") {
    // simultaneous rings all; sequential rings top-down — both pick the first
    // available agent in order (no rotation cursor).
    return agents.find((a) => a.available) ?? null;
  }

  if (queue.strategy === "weighted") {
    // Highest-weight available agent (ties broken by listing order).
    const available = agents.filter((a) => a.available);
    if (available.length === 0) return null;
    return available.reduce((best, a) => ((a.weight ?? 1) > (best.weight ?? 1) ? a : best));
  }

  // round_robin & rotating: next available after the cursor (wraps).
  for (let i = 1; i <= agents.length; i++) {
    const idx = (lastIndex + i) % agents.length;
    if (agents[idx].available) return agents[idx];
  }
  return null;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Whether `date` falls inside the schedule (weekly window, not a holiday). */
export function isWithinHours(schedule: BusinessHours, date: Date = new Date()): boolean {
  if (schedule.holidays.includes(isoDate(date))) return false;
  const window = schedule.weekly.find((w) => w.day === date.getDay());
  if (!window) return false;
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes >= window.openMin && minutes < window.closeMin;
}

export interface IVRResolution {
  option?: IVROption;
  /** Set when the option drills into a submenu. */
  nextMenu?: IVRMenu;
}

/** Resolve a DTMF keypress within a menu, following `menu` options into submenus. */
export function ivrResolve(menus: IVRMenu[], menuId: string, key: string): IVRResolution {
  const menu = menus.find((m) => m.id === menuId);
  const option = menu?.options.find((o) => o.key === key);
  if (!option) return {};
  if (option.action === "menu" && option.target) {
    return { option, nextMenu: menus.find((m) => m.id === option.target) };
  }
  return { option };
}

/** Skills-based routing: pick among agents that hold `skill`, by the queue strategy. */
export function pickAgentBySkill(queue: CallQueue, skill: string, lastIndex = -1): QueueAgent | null {
  const skilled = queue.agents.filter((a) => a.skills?.includes(skill));
  if (skilled.length === 0) return null;
  return pickAgent({ ...queue, agents: skilled }, lastIndex);
}

export interface MonitorAudio {
  supervisorHearsParties: boolean;
  agentHearsSupervisor: boolean;
  customerHearsSupervisor: boolean;
  agentConnected: boolean;
}

/** Audio routing for a supervisor monitor mode (listen / whisper / barge / takeover). */
export function monitorAudio(mode: MonitorMode): MonitorAudio {
  switch (mode) {
    case "listen":
      return { supervisorHearsParties: true, agentHearsSupervisor: false, customerHearsSupervisor: false, agentConnected: true };
    case "whisper":
      return { supervisorHearsParties: true, agentHearsSupervisor: true, customerHearsSupervisor: false, agentConnected: true };
    case "barge":
      return { supervisorHearsParties: true, agentHearsSupervisor: true, customerHearsSupervisor: true, agentConnected: true };
    case "takeover":
      return { supervisorHearsParties: true, agentHearsSupervisor: false, customerHearsSupervisor: true, agentConnected: false };
  }
}

/** Whether a shared-line delegate may perform an action on behalf of the owner. */
export function canActOnBehalf(delegate: Delegate, action: "answer" | "place"): boolean {
  return action === "answer" ? delegate.canAnswer : delegate.canPlaceOnBehalf;
}

/**
 * Group call pickup: the oldest waiting caller in a queue any pickup-group
 * member may grab (earliest `since` wins). Returns null when nothing waits.
 */
export function oldestWaiting(queue: CallQueue): QueuedCall | null {
  if (queue.waiting.length === 0) return null;
  return queue.waiting.reduce((oldest, c) => (c.since < oldest.since ? c : oldest));
}

/**
 * Estimated wait time (seconds) for the next caller joining the queue:
 * (callers ahead × average handle time) ÷ available agents. Webex parity.
 * Callers who requested a callback don't occupy the live hold queue.
 */
export function estimatedWaitSec(queue: CallQueue, avgHandleSec = 180): number {
  const ahead = queue.waiting.filter((c) => !c.callbackRequested).length;
  const agents = queue.agents.filter((a) => a.available).length;
  if (agents === 0) return ahead * avgHandleSec;
  return Math.round((ahead * avgHandleSec) / agents);
}

/**
 * Hunt-group target selection. `all` → first available member;
 * `sequential` → next available after `lastIndex` (wraps, skips unavailable).
 */
export function nextHuntMember(group: HuntGroup, lastIndex = -1): HuntMember | null {
  const members = group.members;
  if (members.length === 0) return null;
  if (group.ring === "all") return members.find((m) => m.available) ?? null;
  for (let i = 1; i <= members.length; i++) {
    const idx = (lastIndex + i) % members.length;
    if (members[idx].available) return members[idx];
  }
  return null;
}
