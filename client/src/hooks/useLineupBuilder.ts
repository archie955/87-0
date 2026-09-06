import { useCallback, useMemo, useReducer } from "react";
import type { Player } from "@/types/playerTypes";
import type { Team } from "@/types/teamTypes";
import type { LineupRole } from "@/services/enum";
import {
  PICK_COUNT,
  MAX_SLOTS,
  createInitialLineupState,
  isLineupComplete,
  isPlayerCompatible,
  lineupBuilderReducer,
  type Lineup5,
  type RollPhase,
} from "@/lib/lineupBuilder";

export interface IglCandidate {
  role: LineupRole;
  player: Player;
}

export interface UseLineupBuilderResult {
  phase: RollPhase;
  lineup: Lineup5;
  /* True once all 5 lineup slots are filled*/
  isComplete: boolean;
  canRoll: boolean;
  canReroll: boolean;
  /* 1-based "Pick X of 5" for display. Accounts for a reroll in progress. */
  pickNumber: number;
  /* 1-based: which of up to MAX_SLOTS team rolls we're currently on. */
  slotNumber: number;
  slotHistory: string[];
  rerolledAtIndex: number | null;
  rolledTeam: Team | null;
  rollSlides: Team[];
  rollSequence: number;
  igl: LineupRole | null;
  iglCandidates: IglCandidate[];
  canPick: (player: Player) => boolean;
  roll: (team: Team, slides: Team[]) => void;
  rollComplete: () => void;
  reroll: (team: Team, slides: Team[]) => void;
  pick: (player: Player) => void;
  selectIgl: (role: LineupRole) => void;
  reset: () => void;
}

const useLineupBuilder = (): UseLineupBuilderResult => {
  const [state, dispatch] = useReducer(
    lineupBuilderReducer,
    undefined,
    createInitialLineupState,
  );

  const complete = isLineupComplete(state.lineup);

  const filledCount = useMemo(
    () =>
      Object.values(state.lineup).filter((player) => player !== null).length,
    [state.lineup],
  );

  const iglCandidates = useMemo<IglCandidate[]>(
    () =>
      (Object.entries(state.lineup) as [LineupRole, Player | null][])
        .filter((entry): entry is [LineupRole, Player] => entry[1] !== null)
        .map(([role, player]) => ({ role, player })),
    [state.lineup],
  );

  const canPick = useCallback(
    (player: Player) => isPlayerCompatible(state.lineup, player),
    [state.lineup],
  );

  const roll = useCallback(
    (team: Team, slides: Team[]) => dispatch({ type: "ROLL", team, slides }),
    [],
  );
  const rollComplete = useCallback(
    () => dispatch({ type: "ROLL_COMPLETE" }),
    [],
  );
  const reroll = useCallback(
    (team: Team, slides: Team[]) => dispatch({ type: "REROLL", team, slides }),
    [],
  );
  const pick = useCallback(
    (player: Player) => dispatch({ type: "PICK", player }),
    [],
  );
  const selectIgl = useCallback(
    (role: LineupRole) => dispatch({ type: "SELECT_IGL", role }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
    phase: state.phase,
    lineup: state.lineup,
    isComplete: complete,
    canRoll: state.phase === "idle" && !complete,
    canReroll:
      state.phase === "picking" &&
      state.rerollAvailable &&
      state.slotNumber < MAX_SLOTS,
    pickNumber: Math.min(filledCount + 1, PICK_COUNT),
    slotNumber: state.slotNumber,
    slotHistory: state.slotHistory,
    rerolledAtIndex: state.rerolledAtIndex,
    rolledTeam: state.rolledTeam,
    rollSlides: state.rollSlides,
    rollSequence: state.rollSequence,
    igl: state.igl,
    iglCandidates,
    canPick,
    roll,
    rollComplete,
    reroll,
    pick,
    selectIgl,
    reset,
  };
};

export default useLineupBuilder;
