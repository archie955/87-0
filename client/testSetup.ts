import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { useRuleStore } from "@/stores/ruleStore";
import { useLoginStore } from "@/stores/loginStore";
import { useNotificationStore } from "@/stores/notificationStore";
import userService from "@/services/user";

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
