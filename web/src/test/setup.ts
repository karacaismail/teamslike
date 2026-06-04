import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

// Stores persist to localStorage (J1). Clear between tests for isolation so a
// persisted value from one test can't bleed into the next.
beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* jsdom provides localStorage; guard for safety */
  }
});
