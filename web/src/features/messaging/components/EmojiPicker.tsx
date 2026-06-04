import * as Menu from "@radix-ui/react-dropdown-menu";
import { Smiley } from "@/lib/icons";
import { useTranslation } from "react-i18next";
import { EMOJI_PALETTE } from "../types";

/** Compact emoji picker (Slack/Teams/WhatsApp-style). */
export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const { t } = useTranslation();
  return (
    <Menu.Root>
      <Menu.Trigger
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-fg hover:bg-surface"
        aria-label={t("messaging.emoji")}
      >
        <Smiley size={18} aria-hidden />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          side="top"
          align="start"
          sideOffset={6}
          className="z-50 w-72 rounded-lg border border-border bg-raised p-2 shadow-xl"
        >
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_PALETTE.map((e) => (
              <Menu.Item
                key={e}
                onSelect={() => onPick(e)}
                className="flex h-8 cursor-pointer items-center justify-center rounded-md text-xl outline-none data-[highlighted]:bg-surface"
              >
                <span aria-hidden>{e}</span>
              </Menu.Item>
            ))}
          </div>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
