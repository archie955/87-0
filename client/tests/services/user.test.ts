import { describe, it, expect, beforeEach, vi } from "vitest";

vi.unmock("@/services/user");

import api from "@/services/api";
import userService from "@/services/user";
import type { UpdatedUser, UserReturned } from "@/types/userTypes";
import { axiosRes } from "../helpers/axios";

const getSpy = vi.spyOn(api, "get");
const putSpy = vi.spyOn(api, "put");
const deleteSpy = vi.spyOn(api, "delete");

beforeEach(() => {
  getSpy.mockReset();
  putSpy.mockReset();
  deleteSpy.mockReset();
});

const user: UserReturned = {
  id: 1,
  username: "s1mple",
  best_score: 5.0,
  email_login: null,
  steam_login: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("userService.getUser", () => {
  it("GETs /users", async () => {
    getSpy.mockResolvedValue(axiosRes(user));

    const out = await userService.getUser();

    expect(getSpy).toHaveBeenCalledWith("/users");
    expect(out).toEqual(user);
  });
});

describe("userService.updateUser", () => {
  it("PUTs the update payload to /users", async () => {
    const updated: UpdatedUser = {
      updated_username: "new-name",
    };
    putSpy.mockResolvedValue(axiosRes(user));

    const out = await userService.updateUser(updated);

    expect(putSpy).toHaveBeenCalledWith("/users", updated);
    expect(out).toEqual(user);
  });
});

describe("userService.deleteUser", () => {
  it("DELETEs /users", async () => {
    deleteSpy.mockResolvedValue(axiosRes(undefined));

    await userService.deleteUser();

    expect(deleteSpy).toHaveBeenCalledWith("/users");
  });
});
