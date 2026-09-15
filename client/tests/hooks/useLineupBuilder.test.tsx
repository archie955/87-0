import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useLineupBuilder from "@/hooks/useLineupBuilder";
import { Roles, lineupRoles } from "@/services/enum";
import type { Player } from "@/types/playerTypes";
import type { Team } from "@/types/teamTypes";
import { makePlayer, makeTeam } from "../helpers/factories";

const opener = makePlayer({ id: 1, role: Roles.OPENER, name: "op1" });
const opener2 = makePlayer({ id: 2, role: Roles.OPENER, name: "op2" });
const closer = makePlayer({ id: 3, role: Roles.CLOSER, name: "cl1" });
const awper = makePlayer({ id: 4, role: Roles.AWPER, name: "aw1" });
const support = makePlayer({ id: 5, role: Roles.SUPPORT, name: "su1" });

const team = makeTeam({ id: 1, name: "Falcons" });
const team2 = makeTeam({ id: 2, name: "Vitality" });
const team3 = makeTeam({ id: 3, name: "Spirit" });
const team4 = makeTeam({ id: 4, name: "MOUZ" });
const team5 = makeTeam({ id: 5, name: "G2" });

const fullDraft = (
  hook: { current: ReturnType<typeof useLineupBuilder> },
  teams: Team[] = [team, team2, team3, team4, team5],
  players: Player[] = [opener, closer, awper, support, opener2],
) => {
  players.forEach((player, i) => {
    const t = teams[i];
    act(() => hook.current.roll(t, [t]));
    act(() => hook.current.rollComplete());
    act(() => hook.current.pick(player));
  });
};

describe("useLineupBuilder", () => {
  it("starts idle with an empty lineup", () => {
    const { result } = renderHook(() => useLineupBuilder());

    expect(result.current.phase).toBe("idle");
    expect(result.current.canRoll).toBe(true);
    expect(result.current.canReroll).toBe(false);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.pickNumber).toBe(1);
    expect(result.current.slotNumber).toBe(1);
    expect(result.current.igl).toBeNull();
    expect(result.current.iglCandidates).toEqual([]);
    expect(result.current.rerolledAtIndex).toBeNull();
    expect(result.current.rolledTeam).toBeNull();
  });

  it("roll transitions to rolling and exposes the team/slides", () => {
    const { result } = renderHook(() => useLineupBuilder());

    act(() => result.current.roll(team, [team2, team]));

    expect(result.current.phase).toBe("rolling");
    expect(result.current.rolledTeam).toEqual(team);
    expect(result.current.rollSlides).toEqual([team2, team]);
    expect(result.current.rollSequence).toBe(1);
    expect(result.current.canRoll).toBe(false);
  });

  it("rollComplete moves to picking and enables reroll once", () => {
    const { result } = renderHook(() => useLineupBuilder());

    act(() => result.current.roll(team, [team]));
    act(() => result.current.rollComplete());

    expect(result.current.phase).toBe("picking");
    expect(result.current.canReroll).toBe(true);
  });

  it("pick places the player, advances the slot, and records history", () => {
    const { result } = renderHook(() => useLineupBuilder());

    act(() => result.current.roll(team, [team]));
    act(() => result.current.rollComplete());
    act(() => result.current.pick(opener));

    expect(result.current.lineup.opener).toEqual(opener);
    expect(result.current.phase).toBe("idle");
    expect(result.current.slotNumber).toBe(2);
    expect(result.current.pickNumber).toBe(2);
    expect(result.current.slotHistory[0]).toBe(team.name);
    expect(result.current.rolledTeam).toBeNull();
  });

  it("canPick reflects the reducer's compatibility rule", () => {
    const { result } = renderHook(() => useLineupBuilder());

    act(() => result.current.roll(team, [team]));
    act(() => result.current.rollComplete());
    act(() => result.current.pick(opener));

    expect(result.current.canPick(opener)).toBe(false);
    expect(result.current.canPick(opener2)).toBe(true);
    expect(result.current.canPick(closer)).toBe(true);
  });

  it("isComplete and canRoll flip after a full draft", () => {
    const { result } = renderHook(() => useLineupBuilder());

    fullDraft(result);

    expect(result.current.isComplete).toBe(true);
    expect(result.current.canRoll).toBe(false);
    expect(result.current.pickNumber).toBe(5);
  });

  it("iglCandidates only lists non-null slots", () => {
    const { result } = renderHook(() => useLineupBuilder());

    act(() => result.current.roll(team, [team]));
    act(() => result.current.rollComplete());
    act(() => result.current.pick(opener));

    expect(result.current.iglCandidates).toEqual([
      { role: lineupRoles.opener, player: opener },
    ]);
  });

  it("selectIgl records the chosen role", () => {
    const { result } = renderHook(() => useLineupBuilder());

    fullDraft(result);

    act(() => result.current.selectIgl(lineupRoles.awper));

    expect(result.current.igl).toBe(lineupRoles.awper);
  });

  it("reroll moves to rolling, bumps the slot, and disables further rerolls", () => {
    const { result } = renderHook(() => useLineupBuilder());

    act(() => result.current.roll(team, [team]));
    act(() => result.current.rollComplete());

    expect(result.current.canReroll).toBe(true);

    act(() => result.current.reroll(team2, [team2]));

    expect(result.current.phase).toBe("rolling");
    expect(result.current.rolledTeam).toEqual(team2);
    expect(result.current.slotNumber).toBe(2);
    expect(result.current.rerolledAtIndex).toBe(0);
    expect(result.current.canReroll).toBe(false);
  });

  it("canReroll is never true at the last slot", () => {
    const { result } = renderHook(() => useLineupBuilder());

    fullDraft(result);

    expect(result.current.canReroll).toBe(false);
  });

  it("reset returns the draft to its initial shape", () => {
    const { result } = renderHook(() => useLineupBuilder());

    fullDraft(result);
    act(() => result.current.selectIgl(lineupRoles.opener));
    act(() => result.current.reset());

    expect(result.current.phase).toBe("idle");
    expect(result.current.isComplete).toBe(false);
    expect(result.current.slotNumber).toBe(1);
    expect(result.current.igl).toBeNull();
    expect(result.current.iglCandidates).toEqual([]);
    expect(result.current.slotHistory.every((s) => s === "")).toBe(true);
  });
});
