import * as Menu from "@radix-ui/react-dropdown-menu";
import { Sticker } from "@/lib/icons";
import { useTranslation } from "react-i18next";

const STICKERS = ["🎉", "🔥", "🚀", "👏", "💯", "😂", "😍", "🤝", "🙌", "✅", "❤️", "👀", "🥳", "💡", "☕", "🍕"];

/** GIF/sticker picker (Teams/Telegram/WhatsApp). Stickers are mocked as large emoji. */
export function GifStickerPicker({ onPick }: { onPick: (sticker: string) => void }) {
  const { t } = useTranslation();
  return (
    <Menu.Root>
      <Menu.Trigger
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-fg hover:bg-surface"
        aria-label={t("messaging.sticker")}
      >
        <Sticker size={18} aria-hidden />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          side="top"
          align="start"
          sideOffset={6}
          className="z-50 w-72 rounded-lg border border-border bg-raised p-2 shadow-xl"
        >
          <div className="grid grid-cols-6 gap-1">
            {STICKERS.map((s) => (
              <Menu.Item
                key={s}
                onSelect={() => onPick(s)}
                className="flex h-10 cursor-pointer items-center justify-center rounded-md text-2xl outline-none data-[highlighted]:bg-surface"
              >
                <span aria-hidden>{s}</span>
              </Menu.Item>
            ))}
          </div>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
