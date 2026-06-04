import { Sparkle, ArrowsLeftRight, ListChecks, MagnifyingGlass } from "@/lib/icons";
import type { Command } from "@/types/domain";
import { DOMAINS } from "./domains";

/**
 * Command registry. In the full architecture each domain module registers its
 * own commands at load time; here we derive navigation commands from the domain
 * registry and add a few cross-cutting AI/action commands. The palette filters
 * this list by RBAC (Command.requires) before display.
 */
const navigationCommands: Command[] = DOMAINS.map((d) => ({
  key: `nav.${d.key}`,
  titleKey: `command.goto`,
  group: "navigate",
  requires: d.requires,
  to: d.path,
  icon: d.icon,
  // title is composed in the palette using the domain label
  prompt: d.labelKey,
}));

const aiCommands: Command[] = [
  {
    key: "ai.summarize",
    titleKey: "command.ai.summarize",
    group: "ai",
    requires: "ai.use",
    prompt: "Summarize my unread activity across this workspace.",
    icon: Sparkle,
  },
  {
    key: "ai.draftReply",
    titleKey: "command.ai.draftReply",
    group: "ai",
    requires: "ai.use",
    prompt: "Draft a reply to the latest message in the active thread.",
    icon: Sparkle,
  },
  {
    key: "ai.translate",
    titleKey: "command.ai.translate",
    group: "ai",
    requires: "ai.use",
    prompt: "Translate the current conversation to Turkish.",
    icon: Sparkle,
  },
];

const actionCommands: Command[] = [
  {
    key: "action.switchWorkspace",
    titleKey: "command.action.switchWorkspace",
    group: "action",
    requires: "dashboard.view",
    icon: ArrowsLeftRight,
  },
  {
    key: "action.newTask",
    titleKey: "command.action.newTask",
    group: "action",
    requires: "docs.view",
    icon: ListChecks,
  },
  {
    key: "action.search",
    titleKey: "command.action.search",
    group: "action",
    requires: "dashboard.view",
    icon: MagnifyingGlass,
  },
];

export const COMMANDS: Command[] = [
  ...aiCommands,
  ...navigationCommands,
  ...actionCommands,
];
