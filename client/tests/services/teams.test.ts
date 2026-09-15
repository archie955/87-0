import { describe, it, expect, beforeEach, vi } from "vitest";

vi.unmock("@/services/teams");

import api from "@/services/api";
import teamService from "@/services/teams";
import type { Teams } from "@/types/teamTypes";
import { axiosRes } from "../helpers/axios";

const getSpy = vi.spyOn(api, "get");

beforeEach(() => {
  getSpy.mockReset();
});

describe("teamService.getTeams", () => {
  it("GETs /teams and returns the response body", async () => {
    const teams: Teams = {
      1: { id: 1, name: "Falcons", players: [] },
      2: { id: 2, name: "Vitality", players: [] },
    };
    getSpy.mockResolvedValue(axiosRes(teams));

    const out = await teamService.getTeams();

    expect(getSpy).toHaveBeenCalledWith("/teams");
    expect(out).toEqual(teams);
  });
});
