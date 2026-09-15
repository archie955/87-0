import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useTeams from "@/hooks/useTeams";
import teamService from "@/services/teams";
import type { Teams } from "@/types/teamTypes";
import { createQueryWrapper } from "../helpers/wrappers";

const falcons: Teams = { 1: { id: 1, name: "Falcons", players: [] } };
const vitality: Teams = { 2: { id: 2, name: "Vitality", players: [] } };

beforeEach(() => {
  vi.mocked(teamService.getTeams).mockReset();
});

describe("useTeams", () => {
  it("exposes fetched teams and clears loading", async () => {
    vi.mocked(teamService.getTeams).mockResolvedValue(falcons);

    const { Wrapper } = createQueryWrapper();
    const { result: hook } = renderHook(() => useTeams(), { wrapper: Wrapper });

    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    expect(hook.current.teams).toEqual(falcons);
    expect(hook.current.isError).toBe(false);
  });

  it("flags isError when the fetch fails", async () => {
    vi.mocked(teamService.getTeams).mockRejectedValue(new Error("nope"));

    const { Wrapper } = createQueryWrapper();
    const { result: hook } = renderHook(() => useTeams(), { wrapper: Wrapper });

    await waitFor(() => expect(hook.current.isError).toBe(true));
    expect(hook.current.teams).toBeNull();
  });

  it("retry() refetches and replaces the cached teams", async () => {
    vi.mocked(teamService.getTeams)
      .mockResolvedValueOnce(falcons)
      .mockResolvedValueOnce(vitality);

    const { Wrapper } = createQueryWrapper();
    const { result: hook } = renderHook(() => useTeams(), { wrapper: Wrapper });

    await waitFor(() => expect(hook.current.teams).toEqual(falcons));

    hook.current.retry();

    await waitFor(() => expect(hook.current.teams).toEqual(vitality));
  });
});
