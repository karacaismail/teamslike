import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import i18n from "@/i18n";
import { queryClient } from "@/lib/query";
import { useAuthStore } from "@/store/authStore";
import { useMessagingStore } from "@/features/messaging/store";
import { MessagingPage } from "@/features/messaging/MessagingPage";

const wrap = (entry: string) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={[entry]}>
      <MessagingPage />
    </MemoryRouter>
  </QueryClientProvider>
);

beforeAll(async () => {
  await i18n.changeLanguage("en");
  useAuthStore.getState().login("ismail@aura.dev");
  useAuthStore.getState().setRole("owner");
});
beforeEach(() => useMessagingStore.getState().setChannel("ch_product"));

describe("deep-linking (J2)", () => {
  it("restores the active channel + topic from the URL on mount", () => {
    render(wrap("/messaging?c=ch_eng&t=tp_rfc"));
    expect(useMessagingStore.getState().activeChannelId).toBe("ch_eng");
    expect(useMessagingStore.getState().activeTopicId).toBe("tp_rfc");
  });

  it("ignores an invalid channel id and keeps the default", () => {
    render(wrap("/messaging?c=ch_nope"));
    expect(useMessagingStore.getState().activeChannelId).toBe("ch_product");
  });
});
