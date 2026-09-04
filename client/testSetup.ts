import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

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

afterEach(() => {
  cleanup();
});
