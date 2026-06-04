import { useNavigate } from "react-router-dom";
import { useMessagingStore } from "@/features/messaging/store";
import { useMeetingStore } from "@/features/meetings/store";
import { useIntelStore } from "@/features/intelligence/store";
import { useAuthStore } from "@/store/authStore";

/**
 * Context bridge between Messaging (Faz 2) and Meetings (Faz 3).
 * Kept as a thin integration layer so neither bounded context imports the
 * other's components — they coordinate via stores + navigation only.
 */

/** Start a meeting from a chat: post a call message, link the meeting, go to room. */
export function useStartMeetingFromChannel() {
  const navigate = useNavigate();
  return (channelId: string, topicId: string, title: string) => {
    const me = useAuthStore.getState().principal?.id ?? "usr_1";
    const meetingId = `mtg_${channelId}`;
    useMeetingStore.getState().startFromChannel(channelId, topicId, title);
    useMessagingStore.getState().postCall(meetingId, me);
    navigate("/meetings");
  };
}

/** Join an existing call referenced by a chat message. */
export function useJoinCall() {
  const navigate = useNavigate();
  return (channelId: string, topicId: string, title: string) => {
    if (useMeetingStore.getState().phase === "idle") {
      useMeetingStore.getState().startFromChannel(channelId, topicId, title);
    }
    navigate("/meetings");
  };
}

/** From a meeting, open the linked channel's full conversation in Messaging. */
export function useOpenLinkedChat() {
  const navigate = useNavigate();
  return (channelId: string) => {
    useMessagingStore.getState().setChannel(channelId);
    navigate("/messaging");
  };
}

/**
 * Open a conversation/meeting in Conversation Intelligence (Faz 4 cross-cut:
 * the Translation/Intelligence open-host service consumed by Faz 2/3 surfaces).
 */
export function useOpenIntelligence() {
  const navigate = useNavigate();
  return (sourceId: string) => {
    useIntelStore.getState().setSource(sourceId);
    navigate("/intelligence");
  };
}

/* ─────────── Meeting ↔ Messaging chat bridge (anti-corruption layer) ───────────
 * Conversation Intelligence and Meetings surfaces used to import the Messaging
 * store directly. They now coordinate through these hooks so neither bounded
 * context depends on Messaging internals (enforced by scripts/check-boundaries.mjs). */

export interface BridgedChatItem {
  id: string;
  authorId: string;
  body: string;
  tMin: number;
}

/** Live, normalized view of a linked channel topic's messages as meeting chat
 *  items. Reactive (subscribes to the Messaging store). Returns [] when the
 *  meeting is not linked to a channel topic. */
export function useLinkedChannelMessages(topicId: string | null): BridgedChatItem[] {
  const messages = useMessagingStore((st) => st.messages);
  if (!topicId) return [];
  return messages
    .filter(
      (m) =>
        m.topicId === topicId &&
        m.parentId === null &&
        !m.deleted &&
        !m.hiddenForMe &&
        m.kind !== "system" &&
        !m.scheduled,
    )
    .slice()
    .sort((a, b) => b.tMinutes - a.tMinutes)
    .map((m) => ({ id: m.id, authorId: m.authorId, body: m.body || "🎙️", tMin: m.tMinutes }));
}

/** Post a message into a linked channel topic (meeting chat → channel). */
export function usePostToLinkedChannel() {
  return (channelId: string, topicId: string, body: string, authorId: string) => {
    useMessagingStore.getState().postExternal(channelId, topicId, body, authorId);
  };
}

/** Push a recap action item into the product channel as a chat message. */
export function useSendActionToChat() {
  return (text: string) => {
    const me = useAuthStore.getState().principal?.id ?? "usr_1";
    useMessagingStore.getState().postExternal("ch_product", "tp_q3", `✅ ${text}`, me);
  };
}

/** Read-only view of whether a meeting is linked to a channel and its phase,
 *  for Messaging surfaces (e.g. the channel header's "ongoing call" badge). */
export function useLinkedMeetingState() {
  const linkedChannelId = useMeetingStore((s) => s.linkedChannelId);
  const phase = useMeetingStore((s) => s.phase);
  return { linkedChannelId, phase };
}
