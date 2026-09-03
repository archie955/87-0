import { create } from "zustand";
import type { Player } from "@/types/playerTypes";
import { Roles } from "@/services/enum";
import type { LineupRole } from "@/services/enum";
import type { Lineup } from "@/types/gameTypes";

interface TeamActions {
  finishGame: () => void;
  selectOpener: (player: Player) => void;
  selectCloser: (player: Player) => void;
  selectAwper: (player: Player) => void;
  selectSupport: (player: Player) => void;
  selectIgl: (p: LineupRole) => void;
  compatibility: (p: Player) => boolean;
  createLineup: (id: string) => Lineup;
}

interface TeamState {
  opener: Player | null;
  closer: Player | null;
  awper: Player | null;
  support: Player | null;
  flex: Player | null;
  igl: number | null;
  actions: TeamActions;
}

const useTeamStore = create<TeamState>((set, get) => ({
  opener: null,
  closer: null,
  awper: null,
  support: null,
  flex: null,
  igl: null,
  actions: {
    finishGame: () => {
      set(() => ({
        opener: null,
        closer: null,
        awper: null,
        support: null,
        flex: null,
        igl: null,
      }));
    },
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
    selectIgl: (p: LineupRole): void => {
      const player = get()[p];
      if (player) {
        set(() => ({ igl: player.id }));
      }
    },
    compatibility: (p: Player): boolean => {
      switch (p.role) {
        case Roles.AWPER:
          if (!get().awper) {
            return true;
          } else if (get().awper?.name === p.name) {
            return false;
          }
          break;

        case Roles.OPENER:
          if (!get().opener) {
            return true;
          } else if (get().opener?.name === p.name) {
            return false;
          }
          break;

        case Roles.CLOSER:
          if (!get().closer) {
            return true;
          } else if (get().closer?.name === p.name) {
            return false;
          }
          break;

        case Roles.SUPPORT:
          if (!get().support) {
            return true;
          } else if (get().support?.name === p.name) {
            return false;
          }
          break;
      }
      if (!get().flex) {
        return true;
      }
      return false;
    },
    createLineup: (id: string): Lineup => {
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
      return lineup;
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
