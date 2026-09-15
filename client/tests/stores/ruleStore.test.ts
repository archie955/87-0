import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  useRuleStore,
  useRules,
  useRuleActions,
  type Rules,
} from "@/stores/ruleStore";

const reset = () => {
  useRuleStore.setState({ rules: "easy" });
};

describe("ruleStore", () => {
  beforeEach(reset);

  it("defaults to 'easy'", () => {
    expect(useRuleStore.getState().rules).toBe("easy");
  });

  it("useRules exposes the current value and re-renders on change", () => {
    const { result } = renderHook(() => useRules());

    expect(result.current).toBe("easy");

    act(() => {
      useRuleStore.getState().actions.setRules("hard");
    });

    expect(result.current).toBe("hard");
  });

  it("useRuleActions.setRules updates the store for both values", () => {
    const { result } = renderHook(() => useRuleActions());

    const transitions: Rules[] = ["hard", "easy", "hard"];

    for (const next of transitions) {
      act(() => {
        result.current.setRules(next);
      });
      expect(useRuleStore.getState().rules).toBe(next);
    }
  });
});
