import { create } from "zustand";

export type Rules = "easy" | "hard";

interface RuleActions {
  setRules: (rules: Rules) => void;
}

interface RuleStore {
  rules: Rules;
  actions: RuleActions;
}

const useRuleStore = create<RuleStore>((set) => ({
  rules: "easy",
  actions: {
    setRules: (rules: Rules): void =>
      set({
        rules: rules,
      }),
  },
}));

export { useRuleStore };

export const useRules = (): Rules => useRuleStore((state) => state.rules);

export const useRuleActions = (): RuleActions =>
  useRuleStore((state) => state.actions);
