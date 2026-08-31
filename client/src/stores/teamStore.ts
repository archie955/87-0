import { create } from "zustand";
import type { Player } from "@/types/playerTypes";
import type { Result } from "@/types/resultTypes";
import { Roles } from "@/services/enum";
import type { LineupRole } from "@/services/enum";
import gameService from "@/services/game";
import type { Lineup, Game } from "@/types/gameTypes";

interface TeamActions {
  startGame: () => Promise<void>;
  finishGame: () => void;
  selectOpener: (player: Player) => void;
  selectCloser: (player: Player) => void;
  selectAwper: (player: Player) => void;
  selectSupport: (player: Player) => void;
  selectIgl: (p: LineupRole) => void;
  compatibility: (p: Player) => boolean;
  submit: (id: string) => Promise<Result>;
}

interface TeamState {
  game: Game | null;
  opener: Player | null;
  closer: Player | null;
  awper: Player | null;
  support: Player | null;
  flex: Player | null;
  igl: number | null;
  actions: TeamActions;
}

const useTeamStore = create<TeamState>((set, get) => ({
  game: null,
  opener: null,
  closer: null,
  awper: null,
  support: null,
  flex: null,
  igl: null,
  actions: {
    startGame: async () => {
      const game = await gameService.getGame();
      set(() => ({
        game: game,
      }));
    },
    finishGame: () => {
      set(() => ({
        game: null,
        opener: null,
        closer: null,
        awper: null,
        support: null,
        flex: null,
        igl: null,
      }));
    },
    selectOpener: (player: Player) => {
      set((state) => {
        if (player.role !== Roles.OPENER) {
          return state;
        } else if (!state.opener) {
          state.opener = player;
        } else if (!state.flex) {
          state.flex = player;
        }
        return state;
      });
    },
    selectCloser: (player: Player) => {
      set((state) => {
        if (player.role !== Roles.CLOSER) {
          return state;
        } else if (!state.closer) {
          state.closer = player;
        } else if (!state.flex) {
          state.flex = player;
        }
        return state;
      });
    },
    selectAwper: (player: Player) => {
      console.log("Chose awper");
      set((state) => {
        if (player.role !== Roles.AWPER) {
          return state;
        } else if (!state.awper) {
          state.awper = player;
        } else if (!state.flex) {
          state.flex = player;
        }
        return state;
      });
    },
    selectSupport: (player: Player): void => {
      set((state) => {
        if (player.role !== Roles.SUPPORT) {
          return state;
        } else if (!state.support) {
          state.support = player;
        } else if (!state.flex) {
          state.flex = player;
        }
        return state;
      });
    },
    selectIgl: (p: LineupRole): void => {
      set((state) => {
        const player = state[p];
        if (player) {
          state.igl = player.id;
        }
        return state;
      });
    },
    compatibility: (p: Player): boolean => {
      switch (p.role) {
        case Roles.AWPER:
          if (!get().awper) {
            return true;
          }
          break;

        case Roles.OPENER:
          if (!get().opener) {
            return true;
          }
          break;

        case Roles.CLOSER:
          if (!get().closer) {
            return true;
          }
          break;

        case Roles.SUPPORT:
          if (!get().support) {
            return true;
          }
          break;
      }
      if (!get().flex) {
        return true;
      }
      return false;
    },
    submit: async (id: string): Promise<Result> => {
      const player_1 = get().opener;
      const player_2 = get().closer;
      const player_3 = get().awper;
      const player_4 = get().support;
      const player_5 = get().flex;
      const igl = get().igl;
      if (
        !player_1 ||
        !player_2 ||
        !player_3 ||
        !player_4 ||
        !player_5 ||
        !igl
      ) {
        throw new Error("Select an IGL");
      }
      const lineup: Lineup = {
        game_id: id,
        player_1: player_1,
        player_2: player_2,
        player_3: player_3,
        player_4: player_4,
        player_5: player_5,
        igl: igl,
      };
      const response = await gameService.submitGame(lineup);
      return response;
    },
  },
}));

export default useTeamStore;

export const useGame = (): Game | null => useTeamStore((state) => state.game);

export const useOpener = (): Player | null =>
  useTeamStore((state) => state.opener);

export const useCloser = (): Player | null =>
  useTeamStore((state) => state.closer);

export const useAwper = (): Player | null =>
  useTeamStore((state) => state.awper);

export const useSupport = (): Player | null =>
  useTeamStore((state) => state.support);

export const useFlex = (): Player | null => useTeamStore((state) => state.flex);

export const useTeamActions = (): TeamActions =>
  useTeamStore((state) => state.actions);
