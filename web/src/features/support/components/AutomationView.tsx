import { ChannelsPanel } from "./ChannelsPanel";
import { FlowBuilder } from "./FlowBuilder";
import { CostPanel } from "./CostPanel";

/** Automation surface: channel onboarding, no-code bot flows, messaging cost. */
export function AutomationView() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 space-y-4 overflow-y-auto p-4">
      <ChannelsPanel />
      <FlowBuilder />
      <CostPanel />
    </div>
  );
}
