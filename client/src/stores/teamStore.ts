import { create } from "zustand";
import { Player } from "@/types/playerTypes";
import { Result } from "@/types/resultTypes";
import {
  useNotificationActions,
  NotificationAction,
} from "@/stores/notificationStore";
import { Roles } from "@/services/enum";
import gameService from "@/services/game";
import { Lineup } from "@/types/gameTypes";

interface TeamActions {
  selectOpener: (player: Player) => void;
  selectCloser: (player: Player) => void;
  selectAwper: (player: Player) => void;
  selectSupport: (player: Player) => void;
  selectIgl: (p: Pick) => void;
  submit: (id: number) => Promise<Result | void>;
}

interface TeamState {
  opener: Player | null;
  closer: Player | null;
  awper: Player | null;
  support: Player | null;
  flex: Player | null;
  igl: number | null;
  note: NotificationAction;
  actions: TeamActions;
}

enum Pick {
  opener = "opener",
  closer = "closer",
  awper = "awper",
  support = "support",
  flex = "flex",
}

const useTeamStore = create<TeamState>((set, get) => ({
  opener: null,
  closer: null,
  awper: null,
  support: null,
  flex: null,
  igl: null,
  note: useNotificationActions(),
  actions: {
    selectOpener: (player: Player) => {
      set((state) => {
        if (player.role !== Roles.OPENER) {
          state.note.setNotification("This pick is invalid", "warning");
          return state;
        } else if (!state.opener) {
          state.opener = player;
        } else if (!state.flex) {
          state.flex = player;
        } else {
          state.note.setNotification("This role is already filled", "warning");
        }
        return state;
      });
    },
    selectCloser: (player: Player) => {
      set((state) => {
        if (player.role !== Roles.CLOSER) {
          state.note.setNotification("This pick is invalid", "warning");
          return state;
        } else if (!state.closer) {
          state.closer = player;
        } else if (!state.flex) {
          state.flex = player;
        } else {
          state.note.setNotification("This role is already filled", "warning");
        }
        return state;
      });
    },
    selectAwper: (player: Player) => {
      set((state) => {
        if (player.role !== Roles.AWPER) {
          state.note.setNotification("This pick is invalid", "warning");
          return state;
        } else if (!state.awper) {
          state.awper = player;
        } else if (!state.flex) {
          state.flex = player;
        } else {
          state.note.setNotification("This role is already filled", "warning");
        }
        return state;
      });
    },
    selectSupport: (player: Player): void => {
      set((state) => {
        if (player.role !== Roles.SUPPORT) {
          state.note.setNotification("This pick is invalid", "warning");
          return state;
        } else if (!state.support) {
          state.support = player;
        } else if (!state.flex) {
          state.flex = player;
        } else {
          state.note.setNotification("This role is already filled", "warning");
        }
        return state;
      });
    },
    selectIgl: (p: Pick): void => {
      set((state) => {
        const player = state[p];
        if (player) {
          state.igl = player.id;
        }
        return state;
      });
    },
    submit: async (id: number): Promise<Result | void> => {
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
        get().note.setNotification("Invalid lineup", "error");
        return;
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
