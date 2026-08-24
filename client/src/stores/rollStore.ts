import { create } from "zustand";

interface RollActions {
  startRoll: () => void;
  finishRoll: () => void;
  Reroll: () => void;
}

type RollStatus = "idle" | "rolling" | "picking";

type RollStore = {
  status: RollStatus;
  rerollStatus: boolean;
  actions: RollActions;
};

const useRollStore = create<RollStore>((set, get) => ({
  status: "idle",
  rerollStatus: true,
  actions: {
    startRoll: () =>
      set(() => ({
        status: "rolling",
      })),
    finishRoll: () =>
      set(() => ({
        status: "picking",
      })),
    Reroll: () => {
      if (get().rerollStatus) {
        set(() => ({
          status: "rolling",
          reroll: false,
        }));
      }
    },
  },
}));

export const useStatus = (): RollStatus =>
  useRollStore((state) => state.status);

export const useRerollStatus = (): boolean =>
  useRollStore((state) => state.rerollStatus);

export const useRollActions = (): RollActions =>
  useRollStore((state) => state.actions);
