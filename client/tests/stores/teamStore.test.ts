import { describe, it, expect, beforeEach } from "vitest";
import useTeamStore, {
  useOpener,
  useCloser,
  useAwper,
  useSupport,
  useFlex,
  useTeamActions,
} from "@/stores/teamStore";
import { renderHook, act } from "@testing-library/react";
import { Roles, lineupRoles } from "@/services/enum";
import { makePlayer } from "../helpers/factories";

const reset = () => {
  useTeamStore.getState().actions.reset();
};

const opener = makePlayer({ id: 1, role: Roles.OPENER, name: "op1" });
const opener2 = makePlayer({ id: 2, role: Roles.OPENER, name: "op2" });
const closer = makePlayer({ id: 3, role: Roles.CLOSER, name: "cl1" });
const awper = makePlayer({ id: 4, role: Roles.AWPER, name: "aw1" });
const support = makePlayer({ id: 5, role: Roles.SUPPORT, name: "su1" });

describe("teamStore", () => {
  beforeEach(reset);

  it("starts empty", () => {
    const s = useTeamStore.getState();
    expect(s.opener).toBeNull();
    expect(s.closer).toBeNull();
    expect(s.awper).toBeNull();
    expect(s.support).toBeNull();
    expect(s.flex).toBeNull();
  });

  it("select<Role> places the first matching player in their home slot", () => {
    const { result } = renderHook(() => useTeamActions());

    act(() => result.current.selectOpener(opener));
    act(() => result.current.selectCloser(closer));
    act(() => result.current.selectAwper(awper));
    act(() => result.current.selectSupport(support));

    const s = useTeamStore.getState();
    expect(s.opener).toBe(opener);
    expect(s.closer).toBe(closer);
    expect(s.awper).toBe(awper);
    expect(s.support).toBe(support);
  });

  it("ignores a player whose role does not match the selector", () => {
    const { result } = renderHook(() => useTeamActions());

    act(() => result.current.selectOpener(closer));

    expect(useTeamStore.getState().opener).toBeNull();
  });

  it("places a second same-role player into flex", () => {
    const { result } = renderHook(() => useTeamActions());

    act(() => result.current.selectOpener(opener));
    act(() => result.current.selectOpener(opener2));

    const s = useTeamStore.getState();
    expect(s.opener).toBe(opener);
    expect(s.flex).toBe(opener2);
  });

  it("does not overwrite flex once it is taken", () => {
    const { result } = renderHook(() => useTeamActions());

    act(() => result.current.selectOpener(opener));
    act(() => result.current.selectCloser(closer));

    act(() => result.current.selectOpener(opener2));

    act(() =>
      result.current.selectCloser(
        makePlayer({ id: 99, role: Roles.CLOSER, name: "cl2" }),
      ),
    );

    expect(useTeamStore.getState().flex).toBe(opener2);
  });

  describe("compatibility", () => {
    it("allows a player whose home slot is empty", () => {
      const { result } = renderHook(() => useTeamActions());
      expect(result.current.compatibility(opener)).toBe(true);
    });

    it("rejects a player already occupying their home slot", () => {
      useTeamStore.setState({ opener });
      const { result } = renderHook(() => useTeamActions());
      expect(result.current.compatibility(opener)).toBe(false);
    });

    it("allows a second same-role player when flex is free", () => {
      useTeamStore.setState({ opener });
      const { result } = renderHook(() => useTeamActions());
      expect(result.current.compatibility(opener2)).toBe(true);
    });

    it("rejects any same-role duplicate once flex is taken", () => {
      useTeamStore.setState({ opener, flex: opener2 });
      const { result } = renderHook(() => useTeamActions());
      expect(
        result.current.compatibility(
          makePlayer({ id: 42, role: Roles.OPENER, name: "op3" }),
        ),
      ).toBe(false);
    });

    it("ignores duplicates when they're a different role and home is empty", () => {
      useTeamStore.setState({ opener });
      const { result } = renderHook(() => useTeamActions());
      expect(result.current.compatibility(closer)).toBe(true);
    });
  });

  describe("createLineup", () => {
    it("throws if the lineup is incomplete", () => {
      const { result } = renderHook(() => useTeamActions());

      expect(() =>
        result.current.createLineup("game-1", lineupRoles.opener),
      ).toThrow(/incomplete/i);
    });

    it("throws if no IGL role resolves to a player", () => {
      useTeamStore.setState({
        opener,
        closer,
        awper,
        support,
        flex: opener2,
      });
      const { result } = renderHook(() => useTeamActions());

      useTeamStore.setState({ support: null });

      expect(() =>
        result.current.createLineup("game-1", lineupRoles.support),
      ).toThrow(/incomplete/i);
    });

    it("returns a full Lineup payload using the IGL player's id", () => {
      useTeamStore.setState({
        opener,
        closer,
        awper,
        support,
        flex: opener2,
      });
      const { result } = renderHook(() => useTeamActions());

      const lineup = result.current.createLineup("game-1", lineupRoles.awper);

      expect(lineup).toEqual({
        game_id: "game-1",
        player_1: opener,
        player_2: closer,
        player_3: awper,
        player_4: support,
        player_5: opener2,
        igl: awper.id,
      });
    });
  });

  it("selector hooks reflect state changes", () => {
    const openerHook = renderHook(() => useOpener());
    const closerHook = renderHook(() => useCloser());
    const awperHook = renderHook(() => useAwper());
    const supportHook = renderHook(() => useSupport());
    const flexHook = renderHook(() => useFlex());

    act(() => {
      useTeamStore.setState({ opener, closer, awper, support, flex: opener2 });
    });

    expect(openerHook.result.current).toBe(opener);
    expect(closerHook.result.current).toBe(closer);
    expect(awperHook.result.current).toBe(awper);
    expect(supportHook.result.current).toBe(support);
    expect(flexHook.result.current).toBe(opener2);
  });

  it("reset clears every slot", () => {
    useTeamStore.setState({ opener, closer, awper, support, flex: opener2 });

    act(() => useTeamStore.getState().actions.reset());

    const s = useTeamStore.getState();
    expect(s.opener).toBeNull();
    expect(s.closer).toBeNull();
    expect(s.awper).toBeNull();
    expect(s.support).toBeNull();
    expect(s.flex).toBeNull();
  });
});
