import { describe, it, expect } from "vitest";
import {
  PICK_COUNT,
  MAX_SLOTS,
  createInitialLineupState,
  isLineupComplete,
  isPlayerCompatible,
  lineupBuilderReducer,
  createLineupPayload,
  type Lineup5,
  type LineupBuilderState,
} from "@/lib/lineupBuilder";
import { Roles, lineupRoles } from "@/services/enum";
import { makePlayer } from "../helpers/factories";
import { makeTeam } from "../helpers/factories";

const opener = makePlayer({ id: 1, role: Roles.OPENER, name: "Opener" });
const opener2 = makePlayer({ id: 2, role: Roles.OPENER, name: "Opener2" });
const closer = makePlayer({ id: 3, role: Roles.CLOSER, name: "Closer" });
const awper = makePlayer({ id: 4, role: Roles.AWPER, name: "AWPer" });
const support = makePlayer({ id: 5, role: Roles.SUPPORT, name: "Support" });
const extra = makePlayer({ id: 6, role: Roles.SUPPORT, name: "Support2" });

const team = makeTeam({ id: 1, name: "Falcons" });
const slides = [makeTeam({ id: 2, name: "Vitality" }), team];

const emptyLineup = (): Lineup5 => ({
  opener: null,
  closer: null,
  awper: null,
  support: null,
  flex: null,
});

describe("createInitialLineupState", () => {
  it("starts idle with a fresh empty lineup", () => {
    const state = createInitialLineupState();

    expect(state.phase).toBe("idle");
    expect(state.slotNumber).toBe(1);
    expect(state.rollSequence).toBe(0);
    expect(state.rolledTeam).toBeNull();
    expect(state.rollSlides).toEqual([]);
    expect(state.rerollAvailable).toBe(true);
    expect(state.rerolledAtIndex).toBeNull();
    expect(state.igl).toBeNull();
    expect(state.lineup).toEqual(emptyLineup());
    expect(state.slotHistory).toHaveLength(PICK_COUNT);
    expect(state.slotHistory.every((s: string) => s === "")).toBe(true);
  });
});

describe("isLineupComplete", () => {
  it("is false with any empty slot", () => {
    expect(isLineupComplete(emptyLineup())).toBe(false);
    expect(
      isLineupComplete({
        ...emptyLineup(),
        opener,
        closer,
        awper,
        support,
      }),
    ).toBe(false);
  });

  it("is true once all five slots are filled", () => {
    expect(
      isLineupComplete({
        opener,
        closer,
        awper,
        support,
        flex: extra,
      }),
    ).toBe(true);
  });
});

describe("isPlayerCompatible", () => {
  it("allows any player when their home slot is empty", () => {
    expect(isPlayerCompatible(emptyLineup(), opener)).toBe(true);
  });

  it("rejects the exact same player already in their home slot", () => {
    const lineup = { ...emptyLineup(), opener };
    expect(isPlayerCompatible(lineup, opener)).toBe(false);
  });

  it("allows a second player of the same role when flex is free", () => {
    const lineup = { ...emptyLineup(), opener };
    expect(isPlayerCompatible(lineup, opener2)).toBe(true);
  });

  it("rejects a second same-role player once flex is taken", () => {
    const lineup = { ...emptyLineup(), opener, flex: extra };
    expect(isPlayerCompatible(lineup, opener2)).toBe(false);
  });

  it("allows different-role players regardless of flex state", () => {
    const lineup = { ...emptyLineup(), opener, flex: extra };
    expect(isPlayerCompatible(lineup, closer)).toBe(true);
  });
});

describe("lineupBuilderReducer", () => {
  const stateWith = (
    overrides: Partial<LineupBuilderState> = {},
  ): LineupBuilderState => ({
    ...createInitialLineupState(),
    ...overrides,
  });

  describe("ROLL", () => {
    it("transitions idle → rolling and records the team/slides", () => {
      const next = lineupBuilderReducer(stateWith(), {
        type: "ROLL",
        team,
        slides,
      });

      expect(next.phase).toBe("rolling");
      expect(next.rolledTeam).toBe(team);
      expect(next.rollSlides).toBe(slides);
      expect(next.rollSequence).toBe(1);
    });

    it("is ignored when the phase is not idle", () => {
      const before = stateWith({ phase: "picking" });
      const after = lineupBuilderReducer(before, {
        type: "ROLL",
        team,
        slides,
      });
      expect(after).toBe(before);
    });

    it("is ignored once the lineup is complete", () => {
      const before = stateWith({
        lineup: { opener, closer, awper, support, flex: extra },
      });
      const after = lineupBuilderReducer(before, {
        type: "ROLL",
        team,
        slides,
      });
      expect(after).toBe(before);
    });
  });

  describe("ROLL_COMPLETE", () => {
    it("transitions rolling → picking", () => {
      const before = stateWith({ phase: "rolling" });
      const after = lineupBuilderReducer(before, { type: "ROLL_COMPLETE" });
      expect(after.phase).toBe("picking");
    });

    it("is a no-op when not rolling", () => {
      const before = stateWith({ phase: "idle" });
      expect(lineupBuilderReducer(before, { type: "ROLL_COMPLETE" })).toBe(
        before,
      );
    });
  });

  describe("PICK", () => {
    it("places a player in their home slot when empty", () => {
      const before = stateWith({ phase: "picking", rolledTeam: team });
      const after = lineupBuilderReducer(before, {
        type: "PICK",
        player: opener,
      });

      expect(after.lineup.opener).toBe(opener);
      expect(after.lineup.flex).toBeNull();
      expect(after.phase).toBe("idle");
      expect(after.slotNumber).toBe(2);
      expect(after.slotHistory[0]).toBe(team.name);
      expect(after.rolledTeam).toBeNull();
    });

    it("places a second same-role player in flex", () => {
      const before = stateWith({
        phase: "picking",
        rolledTeam: team,
        lineup: { ...emptyLineup(), opener },
      });
      const after = lineupBuilderReducer(before, {
        type: "PICK",
        player: opener2,
      });

      expect(after.lineup.opener).toBe(opener);
      expect(after.lineup.flex).toBe(opener2);
    });

    it("is rejected when the phase is not picking", () => {
      const before = stateWith({ phase: "idle" });
      expect(
        lineupBuilderReducer(before, { type: "PICK", player: opener }),
      ).toBe(before);
    });

    it("is rejected without a rolled team", () => {
      const before = stateWith({ phase: "picking", rolledTeam: null });
      expect(
        lineupBuilderReducer(before, { type: "PICK", player: opener }),
      ).toBe(before);
    });

    it("is rejected when the player is not compatible", () => {
      const before = stateWith({
        phase: "picking",
        rolledTeam: team,
        lineup: { ...emptyLineup(), opener },
      });
      expect(
        lineupBuilderReducer(before, { type: "PICK", player: opener }),
      ).toBe(before);
    });
  });

  describe("REROLL", () => {
    it("moves picking → rolling, bumps slot number, and disables reroll", () => {
      const replacement = makeTeam({ id: 9, name: "Replacement" });
      const before = stateWith({
        phase: "picking",
        rolledTeam: team,
        slotNumber: 1,
      });

      const after = lineupBuilderReducer(before, {
        type: "REROLL",
        team: replacement,
        slides,
      });

      expect(after.phase).toBe("rolling");
      expect(after.rolledTeam).toBe(replacement);
      expect(after.slotNumber).toBe(2);
      expect(after.rerollAvailable).toBe(false);
      expect(after.rerolledAtIndex).toBe(0);
      expect(after.slotHistory[0]).toBe(team.name);
      expect(after.slotHistory).toHaveLength(PICK_COUNT + 1); // rerolled
    });

    it("is a no-op once reroll has been used this draft", () => {
      const before = stateWith({
        phase: "picking",
        rolledTeam: team,
        rerollAvailable: false,
      });
      expect(
        lineupBuilderReducer(before, { type: "REROLL", team, slides }),
      ).toBe(before);
    });

    it("is a no-op at the last slot", () => {
      const before = stateWith({
        phase: "picking",
        rolledTeam: team,
        slotNumber: MAX_SLOTS,
      });
      expect(
        lineupBuilderReducer(before, { type: "REROLL", team, slides }),
      ).toBe(before);
    });

    it("is a no-op outside the picking phase", () => {
      const before = stateWith({ phase: "rolling", rolledTeam: team });
      expect(
        lineupBuilderReducer(before, { type: "REROLL", team, slides }),
      ).toBe(before);
    });
  });

  describe("SELECT_IGL", () => {
    it("records the chosen role", () => {
      const before = stateWith({
        lineup: { opener, closer, awper, support, flex: extra },
      });
      const after = lineupBuilderReducer(before, {
        type: "SELECT_IGL",
        role: lineupRoles.opener,
      });
      expect(after.igl).toBe(lineupRoles.opener);
    });
  });

  describe("RESET", () => {
    it("returns the state to a fresh initial shape", () => {
      const before = stateWith({
        phase: "picking",
        rolledTeam: team,
        slotNumber: 3,
        rollSequence: 7,
        lineup: { opener, closer, awper, support, flex: extra },
        igl: lineupRoles.awper,
      });
      const after = lineupBuilderReducer(before, { type: "RESET" });
      expect(after).toEqual(createInitialLineupState());
    });
  });

  it("ignores unknown actions", () => {
    const before = createInitialLineupState();
    // @ts-ignore TS2322
    const after = lineupBuilderReducer(before, { type: "WHO_KNOWS" });
    expect(after).toBe(before);
  });
});

describe("createLineupPayload", () => {
  const completeLineup: Lineup5 = {
    opener,
    closer,
    awper,
    support,
    flex: extra,
  };

  it("returns null when any slot is empty", () => {
    expect(
      createLineupPayload(
        { ...completeLineup, flex: null },
        lineupRoles.awper,
        "g1",
      ),
    ).toBeNull();
  });

  it("returns null when no IGL is selected", () => {
    expect(createLineupPayload(completeLineup, null, "g1")).toBeNull();
  });

  it("returns null when the selected IGL role is empty (defensive)", () => {
    const incomplete: Lineup5 = { ...completeLineup, support: null };
    expect(
      createLineupPayload(incomplete, lineupRoles.support, "g1"),
    ).toBeNull();
  });

  it("builds the payload with the IGL player's id", () => {
    const payload = createLineupPayload(
      completeLineup,
      lineupRoles.awper,
      "game-abc",
    );

    expect(payload).toEqual({
      game_id: "game-abc",
      player_1: opener,
      player_2: closer,
      player_3: awper,
      player_4: support,
      player_5: extra,
      igl: awper.id,
    });
  });
});
