import { create } from "zustand";

export type Rules = "easy" | "hard";

interface RuleActions {
  setHard: () => void;
  setEasy: () => void;
}

interface RuleStore {
  rules: Rules;
  actions: RuleActions;
}

const useRuleStore = create<RuleStore>((set) => ({
  rules: "easy",
  actions: {
    setHard: (): void =>
      set({
        rules: "hard",
      }),
    setEasy: (): void =>
      set({
        rules: "easy",
      }),
  },
}));

export const useRules = (): Rules => useRuleStore((state) => state.rules);

export const useRuleActions = (): RuleActions =>
  useRuleStore((state) => state.actions);
