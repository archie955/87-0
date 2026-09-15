import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useGame from "@/hooks/useGame";
import gameService from "@/services/game";
import type { Game, Lineup } from "@/types/gameTypes";
import type { Result } from "@/types/resultTypes";
import { createQueryWrapper } from "../helpers/wrappers";
import { makePlayer } from "../helpers/factories";

const game: Game = {
  id: "g1",
  team_1_id: 1,
  team_2_id: 2,
  team_3_id: 3,
  team_4_id: 4,
  team_5_id: 5,
  team_6_id: 6,
};

const lineup: Lineup = {
  game_id: "g1",
  player_1: makePlayer({ id: 1 }),
  player_2: makePlayer({ id: 2 }),
  player_3: makePlayer({ id: 3 }),
  player_4: makePlayer({ id: 4 }),
  player_5: makePlayer({ id: 5 }),
  igl: 1,
};

const result: Result = { score: 4.0, cat: "cat_3", best: false };

beforeEach(() => {
  vi.mocked(gameService.getGame).mockReset();
  vi.mocked(gameService.submitGame).mockReset();
});

describe("useGame", () => {
  it("exposes the fetched game and clears loading/error flags", async () => {
    vi.mocked(gameService.getGame).mockResolvedValue(game);

    const { Wrapper } = createQueryWrapper();
    const { result: hook } = renderHook(() => useGame(), { wrapper: Wrapper });

    expect(hook.current.isLoading).toBe(true);

    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    expect(hook.current.game).toEqual(game);
    expect(hook.current.isError).toBe(false);
  });

  it("flags isError when the initial fetch fails", async () => {
    vi.mocked(gameService.getGame).mockRejectedValue(new Error("nope"));

    const { Wrapper } = createQueryWrapper();
    const { result: hook } = renderHook(() => useGame(), { wrapper: Wrapper });

    await waitFor(() => expect(hook.current.isError).toBe(true));
    expect(hook.current.game).toBeNull();
  });

  it("startNewGame refetches and resolves on success", async () => {
    vi.mocked(gameService.getGame).mockResolvedValue(game);

    const { Wrapper } = createQueryWrapper();
    const { result: hook } = renderHook(() => useGame(), { wrapper: Wrapper });

    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    await expect(hook.current.startNewGame()).resolves.toBeUndefined();

    expect(gameService.getGame).toHaveBeenCalledTimes(2);
  });

  it("startNewGame throws when the refetch fails, using the error message", async () => {
    vi.mocked(gameService.getGame)
      .mockResolvedValueOnce(game)
      .mockRejectedValueOnce(new Error("boom"));

    const { Wrapper } = createQueryWrapper();
    const { result: hook } = renderHook(() => useGame(), { wrapper: Wrapper });

    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    await expect(hook.current.startNewGame()).rejects.toThrow(/boom/i);
  });

  it("submitLineup delegates to gameService.submitGame", async () => {
    vi.mocked(gameService.getGame).mockResolvedValue(game);
    vi.mocked(gameService.submitGame).mockResolvedValue(result);

    const { Wrapper } = createQueryWrapper();
    const { result: hook } = renderHook(() => useGame(), { wrapper: Wrapper });

    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    const out = await hook.current.submitLineup(lineup);

    expect(gameService.submitGame).toHaveBeenCalledWith(lineup);
    expect(out).toEqual(result);
  });
});
