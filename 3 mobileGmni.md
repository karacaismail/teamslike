# Mobile UX Analysis – AURA (mobileGmni.md)

> **Goal**: Provide an exhaustive, mobile‑first UX audit of the AURA frontend codebase (`/web/src/...`). The audit focuses on **adaptive**, **fluid** design, **accessibility**, and **performance** without altering any source files. All recommendations reference existing components (e.g., `AppShell`, `SupportLayout`, `MessagingPage`, `PhoneLayout`, `MeetingRoom`, etc.) and prioritise **Phosphor Icons** for any suggested iconography.

---

## 1. Architectural Overview – Mobile‑First Baseline

| Layer | Typical Entry Point | Mobile‑First Status |
|-------|--------------------|---------------------|
| **Shell** | `AppShell.tsx` (L71) | Uses `hidden md:block` for side navigation – **non‑responsive**. Mobile fallback missing. |
| **Feature Domains** | `features/*` (e.g., `messaging`, `telephony`, `meetings`) | Most pages assume a three‑column desktop layout; breakpoints rarely defined beyond `md`. |
| **State Layer** | Zustand stores (`*Store.ts`) | Stores are agnostic, but UI components don’t react to viewport changes, leading to layout thrashing. |
| **Styling** | Tailwind CSS v4 | Tailwind utilities for spacing are present, yet fluid units (`flex`, `grid`, `gap`) are under‑utilised. |

**Conclusion**: The app is built as a deterministic SPA but lacks a true mobile‑first foundation. All major screens start with a desktop‑centric layout and hide essential UI on mobile.

---

## 2. Core Navigation – `AppShell.tsx`

- **Issue**: `hidden md:block` hides the **aside navigation** on any viewport < 768 px. No alternative navigation (hamburger, bottom‑nav) is provided.
- **Impact**: Mobile users cannot reach any primary domain (Messaging, Meetings, Support) without a custom URL.
- **Recommendation**:
  1. Replace the static `<aside>` with a **responsive drawer** that slides in from the left, toggled by a **hamburger button** (`Menu` Phosphor icon).
  2. Add a **Bottom Navigation Bar** (`BottomNav`) visible on `< md` that mirrors the desktop tabs (Messaging, Meetings, Support, etc.).
  3. Use Tailwind `fixed inset-x-0 bottom-0 flex justify-around bg-bg border-t border-border` for the bar.
  4. Ensure `aria-controls`, `aria-expanded`, and focus‑trap for the drawer per WCAG 2.1.

---

## 3. Top Bar – `TopBar.tsx`

- **Issue**: `WorkspaceSwitcher` is hidden on mobile (`hidden md:block`). Search input also hidden.
- **Impact**: Users cannot switch workspaces or perform quick search on small screens.
- **Recommendation**:
  1. Collapse the workspace selector into a **modal bottom‑sheet** opened via a `Folder` Phosphor icon.
  2. Convert the search input to an **expandable overlay** triggered by a `MagnifyingGlass` icon.
  3. Apply `h-[calc(100dvh-56px)]` to the overlay to respect mobile safe‑area insets.

---

## 4. Messaging – `MessagingPage.tsx`

- **Current Layout**: Three‑column layout (`CommunitiesBar`, `MessagingSidebar`, `MessageList`). All columns use fixed widths (`w-64`, `w-80`).
- **Mobile Breakpoint**: No responsive adjustments; columns overflow, causing horizontal scroll.
- **Recommendations**:
  1. **Stack‑Navigation**: Collapse to a single‑column view where the **sidebar** becomes a **sliding panel** (`Drawer`) toggled by a `ChatTeardropText` icon.
  2. Use **virtualised list** for messages to keep performance smooth on long chats.
  3. Implement **long‑press** on message bubbles to open an **action sheet** (save, pin, reply). Use `DotsThreeVertical` Phosphor icon for the sheet trigger.
  4. Provide **swipe gestures**: left swipe to reply, right swipe to mark as read.

---

## 5. Telephony – `PhoneLayout.tsx`

- **Issue**: Ten tabs (`keypad`, `directory`, `voicemail`, …) rendered as `flex flex-wrap`. On mobile they wrap into multiple rows, consuming vertical space and causing accidental taps.
- **Impact**: Poor discoverability and ergonomics; critical call actions become hard to reach.
- **Recommendations**:
  1. Convert tabs into a **bottom‑sheet tab bar** (`BottomTabBar`) with **circular icons** (Phosphor `Phone`, `Dialpad`, `Voicemail`, `ChatTeardropText`, `ChartLine`, `Gear`, `User`, `Clipboard`, `Envelope`, `Bell`). Max 5‑6 visible; overflow placed under a **More** (`DotsThree` icon) menu.
  2. Implement **adaptive sizing**: each tap target ≥ 48 px, using Tailwind `min-w-[48px] min-h-[48px]`.
  3. For active call bar, use a **sticky mini‑controller** at the top of the screen that collapses into a **floating action button** when scrolling.

---

## 6. Meetings – `MeetingRoom.tsx`

- **Issue**: `SidePanel` on the right (`w-80`) pushes the main video canvas, which collapses to an unreadable width on mobile.
- **Impact**: Video participants become invisible; UI feels cramped.
- **Recommendations**:
  1. Replace `SidePanel` with a **bottom drawer** that slides up (`Height: 40%` default) showing participant list, chat, and reactions.
  2. Use **Picture‑in‑Picture (PiP)** for the local video thumbnail when the drawer is open, keeping it visible.
  3. Adopt a **fluid grid** for the stage: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2` so that on small screens the stage collapses to a single column.
  4. Ensure **auto‑layout** respects `safe-area-inset-bottom` to avoid overlap with system UI.

---

## 7. Support – `SupportLayout.tsx` & Related Panels

- **Problem**: `InboxNav`, `ContactPanel`, and `ConversationView` are hidden (`hidden md:block`) on mobile, leaving agents without any UI.
- **Recommendations**:
  1. **Tab‑based Bottom Navigation** with three primary sections: **Inbox**, **Chat**, **Profile** (uses `Tray`, `ChatTeardropText`, `User` Phosphor icons).
  2. **Swipe‑to‑open** the conversation list as a left drawer.
  3. Convert **labels** and **CSAT** interactions into **chip selectors** that expand into a modal for detailed rating.
  4. Use **auto‑scroll** with `scroll-snap-type` for the message thread to improve perceived performance on mobile.

---

## 8. Forms & Input Controls – Global Patterns

| Component | Mobile Issue | Recommended Fix |
|-----------|--------------|----------------|
| Text inputs (`<input>`, `<textarea>`) | Fixed height, keyboard obscures content | Use `h-[calc(100dvh-56px)]` on containers; apply `scrollIntoView` on focus; add `inputmode` where appropriate. |
| Buttons | Small tap targets (24 px) | Enforce `min-w-[48px] min-h-[48px]` via Tailwind `min-w-[48px] min-h-[48px]`. |
| Dropdowns / Selects | Not native mobile picker | Replace with `<select>` styled as native picker or use `Combobox` component that triggers a **bottom sheet**. |
| Date/Time pickers | Custom UI not mobile‑friendly | Use native `<input type="date">` / `<input type="time">` to leverage OS picker. |

**Accessibility**: Add `aria-label`, `aria-controls`, `role="dialog"` for modals, and ensure focus is trapped.

---

## 9. Performance & Fluidity

1. **Virtualisation** for long lists (messages, participants) – integrate `react‑virtual` to keep DOM node count low.
2. **CSS‑only animations** for panel transitions (e.g., `transition-transform`, `duration-300`). Avoid JS‑driven animations that block the main thread on low‑end devices.
3. **Image & Icon Loading**: Use **Phosphor React** icons as inline SVGs – they are lightweight and scale with `rem` units, eliminating separate image requests.
4. **Responsive Images**: Where avatars are used, provide `srcset` with 1x/2x densities.

---

## 10. Checklist for Mobile‑First Refactor

- [ ] Replace all `hidden md:block` sidebars with **drawer** components.
- [ ] Implement **bottom navigation** covering primary domains.
- [ ] Add **long‑press action sheets** for message bubbles and list items.
- [ ] Ensure every interactive element meets **48 px tap target** guideline.
- [ ] Provide **offline indicator** in the top bar (`Signal`, `WifiNone` icons).
- [ ] Introduce **virtual scrolling** for message and participant lists.
- [ ] Validate all modals with **focus trap** and `aria‑modal="true"`.
- [ ] Conduct **mobile performance audit** (Lighthouse) to verify **First Contentful Paint < 1.5 s** on typical 4G.

---

## 11. Summary

The current AURA SPA is built with a desktop‑centric mindset; mobile users encounter hidden navigation, cramped layouts, and missing interaction patterns. By adopting a **mobile‑first strategy**—drawer navigation, bottom tab bars, fluid grids, long‑press/action‑sheet gestures, and strict accessibility guidelines—the platform will deliver a **responsive, adaptive, and fluid** experience that feels native on phones and tablets while preserving the rich desktop experience.

**All recommendations are purely declarative; no code changes have been made.** The next step is a collaborative design hand‑off where the UI/UX team can prototype the suggested components (using Phosphor icons) and validate them with user testing.
