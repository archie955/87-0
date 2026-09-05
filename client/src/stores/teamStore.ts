import { create } from "zustand";
import type { Player } from "@/types/playerTypes";
import { Roles } from "@/services/enum";
import type { LineupRole } from "@/services/enum";
import type { Lineup } from "@/types/gameTypes";

interface TeamActions {
  reset: () => void;
  selectOpener: (player: Player) => void;
  selectCloser: (player: Player) => void;
  selectAwper: (player: Player) => void;
  selectSupport: (player: Player) => void;
  compatibility: (p: Player) => boolean;
  createLineup: (gameId: string, iglRole: LineupRole) => Lineup;
}

interface TeamState {
  opener: Player | null;
  closer: Player | null;
  awper: Player | null;
  support: Player | null;
  flex: Player | null;
  actions: TeamActions;
}

const useTeamStore = create<TeamState>((set, get) => ({
  opener: null,
  closer: null,
  awper: null,
  support: null,
  flex: null,

  actions: {
    reset: () =>
      set({
        opener: null,
        closer: null,
        awper: null,
        support: null,
        flex: null,
      }),

    selectOpener: (player: Player) => {
      if (player.role !== Roles.OPENER) {
        return;
      } else if (!get().opener) {
        set(() => ({ opener: player }));
      } else if (!get().flex) {
        set(() => ({ flex: player }));
      }
    },
    selectCloser: (player: Player) => {
      if (player.role !== Roles.CLOSER) {
        return;
      } else if (!get().closer) {
        set(() => ({ closer: player }));
      } else if (!get().flex) {
        set(() => ({ flex: player }));
      }
    },
    selectAwper: (player: Player) => {
      if (player.role !== Roles.AWPER) {
        return;
      } else if (!get().awper) {
        set(() => ({ awper: player }));
      } else if (!get().flex) {
        set(() => ({ flex: player }));
      }
    },
    selectSupport: (player: Player): void => {
      if (player.role !== Roles.SUPPORT) {
        return;
      } else if (!get().support) {
        set(() => ({ support: player }));
      } else if (!get().flex) {
        set(() => ({ flex: player }));
      }
    },

    compatibility: (player) => {
      const state = get();

      switch (player.role) {
        case Roles.AWPER:
          if (!state.awper) return true;
          if (state.awper.name === player.name) return false;
          break;

        case Roles.OPENER:
          if (!state.opener) return true;
          if (state.opener.name === player.name) return false;
          break;

        case Roles.CLOSER:
          if (!state.closer) return true;
          if (state.closer.name === player.name) return false;
          break;

        case Roles.SUPPORT:
          if (!state.support) return true;
          if (state.support.name === player.name) return false;
          break;
      }

      return !state.flex;
    },

    createLineup: (gameId, iglRole) => {
      const state = get();

      const player_1 = state.opener;
      const player_2 = state.closer;
      const player_3 = state.awper;
      const player_4 = state.support;
      const player_5 = state.flex;

      const iglPlayer = state[iglRole];

      if (!player_1 || !player_2 || !player_3 || !player_4 || !player_5) {
        throw new Error("Lineup is incomplete");
      }

      if (!iglPlayer) {
        throw new Error("Select an IGL");
      }

      return {
        game_id: gameId,
        player_1,
        player_2,
        player_3,
        player_4,
        player_5,
        igl: iglPlayer.id,
      };
    },
  },
}));

export default useTeamStore;

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
