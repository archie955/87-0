import type { Player } from "@/types/playerTypes";
import type { Team } from "@/types/teamTypes";
import type { Lineup } from "@/types/gameTypes";
import type { Role, LineupRole } from "@/services/enum";
import { Roles, lineupRoles } from "@/services/enum";

export const PICK_COUNT = 5;
export const MAX_SLOTS = PICK_COUNT + 1;

export type RollPhase = "idle" | "rolling" | "picking";

export type Lineup5 = Record<LineupRole, Player | null>;

export interface LineupBuilderState {
  phase: RollPhase;
  /* 1-based: which of up to MAX_SLOTS team rolls we're currently on. */
  slotNumber: number;
  /* Bumped on every new roll; lets the UI key/replay the roll animation. */
  rollSequence: number;
  /* The team on offer right now, once a roll has resolved. */
  rolledTeam: Team | null;
  /* The decoy teams for the current roll animation. */
  rollSlides: Team[];
  rerollAvailable: boolean;
  /* 0-based index into slotHistory that was skipped via reroll, if any. */
  rerolledAtIndex: number | null;
  /* Team name shown at each slot, for the progress trail. */
  slotHistory: string[];
  lineup: Lineup5;
  igl: LineupRole | null;
}

const emptyLineup = (): Lineup5 => ({
  opener: null,
  closer: null,
  awper: null,
  support: null,
  flex: null,
});

export const createInitialLineupState = (): LineupBuilderState => ({
  phase: "idle",
  slotNumber: 1,
  rollSequence: 0,
  rolledTeam: null,
  rollSlides: [],
  rerollAvailable: true,
  rerolledAtIndex: null,
  // eslint-disable-next-line @typescript/no-unsafe-assignment
  slotHistory: Array(PICK_COUNT).fill(""),
  lineup: emptyLineup(),
  igl: null,
});

export const isLineupComplete = (lineup: Lineup5): boolean =>
  Object.values(lineup).every((player) => player !== null);

const HOME_SLOT: Record<Role, LineupRole> = {
  [Roles.OPENER]: lineupRoles.opener,
  [Roles.CLOSER]: lineupRoles.closer,
  [Roles.AWPER]: lineupRoles.awper,
  [Roles.SUPPORT]: lineupRoles.support,
};

export const isPlayerCompatible = (
  lineup: Lineup5,
  player: Player,
): boolean => {
  const homeSlot = HOME_SLOT[player.role];
  const homePlayer = lineup[homeSlot];

  if (!homePlayer) return true;
  if (homePlayer.id === player.id) return false;

  return lineup.flex === null;
};

const placePlayer = (lineup: Lineup5, player: Player): Lineup5 => {
  const homeSlot = HOME_SLOT[player.role];

  if (!lineup[homeSlot]) {
    return { ...lineup, [homeSlot]: player };
  }

  return { ...lineup, flex: player };
};

export type LineupBuilderAction =
  | { type: "ROLL"; team: Team; slides: Team[] }
  | { type: "ROLL_COMPLETE" }
  | { type: "REROLL"; team: Team; slides: Team[] }
  | { type: "PICK"; player: Player }
  | { type: "SELECT_IGL"; role: LineupRole }
  | { type: "RESET" };

export const lineupBuilderReducer = (
  state: LineupBuilderState,
  action: LineupBuilderAction,
): LineupBuilderState => {
  switch (action.type) {
    case "ROLL": {
      if (state.phase !== "idle" || isLineupComplete(state.lineup)) {
        return state;
      }

      return {
        ...state,
        phase: "rolling",
        rolledTeam: action.team,
        rollSlides: action.slides,
        rollSequence: state.rollSequence + 1,
      };
    }

    case "ROLL_COMPLETE": {
      if (state.phase !== "rolling") return state;
      return { ...state, phase: "picking" };
    }

    case "REROLL": {
      if (
        state.phase !== "picking" ||
        !state.rerollAvailable ||
        state.slotNumber >= MAX_SLOTS ||
        state.rolledTeam === null
      ) {
        return state;
      }

      const rolledTeam = state.rolledTeam;
      const rerolledIndex = state.slotNumber - 1;
      const nextHistory = [...state.slotHistory];
      nextHistory[rerolledIndex] = rolledTeam.name;
      nextHistory.push("");

      return {
        ...state,
        phase: "rolling",
        slotNumber: state.slotNumber + 1,
        rollSequence: state.rollSequence + 1,
        rerollAvailable: false,
        rerolledAtIndex: rerolledIndex,
        slotHistory: nextHistory,
        rolledTeam: action.team,
        rollSlides: action.slides,
      };
    }

    case "PICK": {
      if (state.phase !== "picking" || !state.rolledTeam) return state;
      if (!isPlayerCompatible(state.lineup, action.player)) return state;

      const pickedIndex = state.slotNumber - 1;
      const nextHistory = [...state.slotHistory];
      nextHistory[pickedIndex] = state.rolledTeam.name;

      return {
        ...state,
        phase: "idle",
        slotNumber: state.slotNumber + 1,
        slotHistory: nextHistory,
        lineup: placePlayer(state.lineup, action.player),
        rolledTeam: null,
        rollSlides: [],
      };
    }

    case "SELECT_IGL":
      return { ...state, igl: action.role };

    case "RESET":
      return createInitialLineupState();

    default:
      return state;
  }
};

export const createLineupPayload = (
  lineup: Lineup5,
  igl: LineupRole | null,
  gameId: string,
): Lineup | null => {
  const { opener, closer, awper, support, flex } = lineup;

  if (!opener || !closer || !awper || !support || !flex) return null;

  const iglPlayer = igl ? lineup[igl] : null;
  if (!iglPlayer) return null;

  return {
    game_id: gameId,
    player_1: opener,
    player_2: closer,
    player_3: awper,
    player_4: support,
    player_5: flex,
    igl: iglPlayer.id,
  };
};
