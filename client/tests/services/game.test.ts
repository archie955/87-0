import { describe, it, expect, beforeEach, vi } from "vitest";

vi.unmock("@/services/game");

import api from "@/services/api";
import gameService from "@/services/game";
import type { Game, Lineup } from "@/types/gameTypes";
import type { Result } from "@/types/resultTypes";
import { axiosRes } from "../helpers/axios";
import { makePlayer } from "../helpers/factories";

const postSpy = vi.spyOn(api, "post");

beforeEach(() => {
  postSpy.mockReset();
});

const game: Game = {
  id: "game-1",
  team_1_id: 1,
  team_2_id: 2,
  team_3_id: 3,
  team_4_id: 4,
  team_5_id: 5,
  team_6_id: 6,
};

describe("gameService.getGame", () => {
  it("POSTs to /games and returns the response body", async () => {
    postSpy.mockResolvedValue(axiosRes(game));

    const result = await gameService.getGame();

    expect(postSpy).toHaveBeenCalledWith("/games");
    expect(result).toEqual(game);
  });
});

describe("gameService.submitGame", () => {
  const lineup: Lineup = {
    game_id: "game-1",
    player_1: makePlayer({ id: 1 }),
    player_2: makePlayer({ id: 2 }),
    player_3: makePlayer({ id: 3 }),
    player_4: makePlayer({ id: 4 }),
    player_5: makePlayer({ id: 5 }),
    igl: 3,
  };
  const result: Result = { score: 4.2, cat: "cat_3", best: true };

  it("POSTs the full lineup to /games/{game_id}", async () => {
    postSpy.mockResolvedValue(axiosRes(result));

    const out = await gameService.submitGame(lineup);

    expect(postSpy).toHaveBeenCalledWith("/games/game-1", lineup);
    expect(out).toEqual(result);
  });
});
