import * as React from "react";
import { Forbidden } from "@/components/ui/Forbidden";
import { useTranslation } from "react-i18next";
import { Prohibit } from "@/lib/icons";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { useUrlSelection } from "@/lib/useUrlSelection";
import { useMessagingStore } from "./store";
import { CommunitiesBar } from "./components/CommunitiesBar";
import { MessagingSidebar } from "./components/MessagingSidebar";
import { StoriesBar } from "./components/StoriesBar";
import { ChannelHeader } from "./components/ChannelHeader";
import { PinnedBar } from "./components/PinnedBar";
import { MessageList } from "./components/MessageList";
import { TypingIndicator } from "./components/TypingIndicator";
import { MessageComposer } from "./components/MessageComposer";
import { ThreadPanel } from "./components/ThreadPanel";
import { DetailsPanel } from "./components/DetailsPanel";
import { Card } from "@/components/ui/primitives";

export function MessagingPage() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.can);
  const threadOpen = useMessagingStore((s) => s.threadRootId);
  const detailsOpen = useMessagingStore((s) => s.detailsOpen);

  // Deep-link the active channel + topic into the URL (?c=&t=) so the selection
  // is shareable and survives reload, and notifications can target it. (J2)
  const activeChannelId = useMessagingStore((s) => s.activeChannelId);
  const activeTopicId = useMessagingStore((s) => s.activeTopicId);
  const setChannel = useMessagingStore((s) => s.setChannel);
  const setTopic = useMessagingStore((s) => s.setTopic);
  const channels = useMessagingStore((s) => s.channels);
  const topics = useMessagingStore((s) => s.topics);
  useUrlSelection("c", activeChannelId, setChannel, (id) => channels.some((c) => c.id === id));
  useUrlSelection("t", activeTopicId, setTopic, (id) => topics.some((tp) => tp.id === id));

  // When the workspace changes, re-select a channel that belongs to it so the
  // switch visibly changes content instead of showing a stale selection (J5).
  const workspaceId = useTenantStore((s) => s.workspaceId);
  React.useEffect(() => {
    const visible = channels.filter((c) => c.workspaceId == null || c.workspaceId === workspaceId);
    if (!visible.some((c) => c.id === activeChannelId)) {
      const first = visible.find((c) => c.kind !== "dm") ?? visible[0];
      if (first) setChannel(first.id);
    }
    // Run on workspace change only; channel list is static seed.
  }, [workspaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!can("messaging.view")) {
    return <Forbidden />;
  }

  return (
    <div className="flex h-full min-h-0">
      <CommunitiesBar />
      <MessagingSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <StoriesBar />
        <ChannelHeader />
        <PinnedBar />
        <MessageList />
        <TypingIndicator />
        <MessageComposer />
      </div>
      {threadOpen ? <ThreadPanel /> : null}
      {detailsOpen ? <DetailsPanel /> : null}
    </div>
  );
}
