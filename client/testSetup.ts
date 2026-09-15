import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { useRuleStore } from "@/stores/ruleStore";
import { useLoginStore } from "@/stores/loginStore";
import { useNotificationStore } from "@/stores/notificationStore";
import userService from "@/services/user";

if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

if (typeof window !== "undefined" && !window.ResizeObserver) {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverMock;
}

if (typeof window !== "undefined" && !window.IntersectionObserver) {
  class IntersectionObserverMock {
    root = null;
    rootMargin = "";
    thresholds: number[] = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  // @ts-expect-error — only the shape matters for jsdom.
  window.IntersectionObserver = IntersectionObserverMock;
}

if (typeof Element !== "undefined" && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = function getAnimations() {
    return [];
  };
}

vi.mock("@/services/email", () => ({
  default: {
    createAccount: vi.fn(),
    login: vi.fn(),
  },
}));

vi.mock("@/services/game", async () => ({
  default: {
    getGame: vi.fn(),
    submitGame: vi.fn(),
  },
}));

vi.mock("@/services/teams", async () => ({
  default: {
    getTeams: vi.fn(),
  },
}));

vi.mock("@/services/user", async () => ({
  default: {
    deleteUser: vi.fn(),
    updateUser: vi.fn(),
    getUser: vi.fn(),
  },
}));

vi.mock("@/services/auth", async () => ({
  default: {
    logout: vi.fn(),
  },
}));

beforeEach(() => {
  vi.mocked(userService.getUser).mockRejectedValue(
    new Error("no active session"),
  );
});

const initialRuleState = useRuleStore.getState();
const initialLoginState = useLoginStore.getState();
const initialNotificationState = useNotificationStore.getState();

afterEach(() => {
  useRuleStore.setState(initialRuleState, true);
  useLoginStore.setState(initialLoginState, true);
  useNotificationStore.setState(initialNotificationState, true);
});

afterEach(() => {
  cleanup();
});
