import { create } from "zustand";

interface RollActions {
  startRoll: () => void;
  finishRoll: () => void;
  resetRoll: () => void;
  reroll: () => void;
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

    resetRoll: () =>
      set(() => ({
        status: "idle",
      })),

    reroll: () => {
      if (!get().rerollStatus) {
        return;
      }
      set(() => ({
        status: "rolling",
        rerollStatus: false,
      }));
    },
  },
}));

export const useStatus = (): RollStatus =>
  useRollStore((state) => state.status);

export const useRerollStatus = (): boolean =>
  useRollStore((state) => state.rerollStatus);

export const useRollActions = (): RollActions =>
  useRollStore((state) => state.actions);
