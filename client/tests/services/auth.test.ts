import { describe, it, expect, beforeEach, vi } from "vitest";

vi.unmock("@/services/auth");

import api from "@/services/api";
import authService from "@/services/auth";
import { axiosRes } from "../helpers/axios";

const postSpy = vi.spyOn(api, "post");

beforeEach(() => {
  postSpy.mockReset();
});

describe("authService.logout", () => {
  it("POSTs to /auth/logout", async () => {
    postSpy.mockResolvedValue(axiosRes(undefined));

    await authService.logout();

    expect(postSpy).toHaveBeenCalledWith("/auth/logout");
  });
});
