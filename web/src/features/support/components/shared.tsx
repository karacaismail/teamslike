import {
  WarningCircle,
  CaretUp,
  Minus,
  CaretDown,
  Circle,
  ChatCircle,
  EnvelopeSimple,
  WhatsappLogo,
  InstagramLogo,
  FacebookLogo,
  TelegramLogo,
  ChatText,
  Clock,
} from "@/lib/icons";
import type { IconType } from "@/types/domain";
import { CONTACTS, AGENTS } from "../data";
import type { ChannelType, Priority } from "../types";

export const contactName = (id: string): string => CONTACTS.find((c) => c.id === id)?.name ?? id;
export const agentName = (id?: string): string | undefined =>
  id ? (AGENTS.find((a) => a.id === id)?.name ?? id) : undefined;

export const PRIORITY: Record<Priority, { Icon: IconType; tone: string }> = {
  urgent: { Icon: WarningCircle, tone: "text-danger" },
  high: { Icon: CaretUp, tone: "text-warning" },
  medium: { Icon: Minus, tone: "text-accent" },
  low: { Icon: CaretDown, tone: "text-muted" },
  none: { Icon: Circle, tone: "text-muted" },
};

export const CHANNEL_ICON: Record<ChannelType, IconType> = {
  livechat: ChatCircle,
  email: EnvelopeSimple,
  whatsapp: WhatsappLogo,
  instagram: InstagramLogo,
  facebook: FacebookLogo,
  telegram: TelegramLogo,
  sms: ChatText,
};

export const SlaIcon = { Clock, WarningCircle };
