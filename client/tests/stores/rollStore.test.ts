import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useRollStore, {
  useStatus,
  useRerollStatus,
  useRollActions,
} from "@/stores/rollStore";

const reset = () => {
  useRollStore.getState().actions.reset();
};

describe("rollStore", () => {
  beforeEach(reset);

  it("starts idle with reroll available", () => {
    expect(useRollStore.getState().status).toBe("idle");
    expect(useRollStore.getState().rerollStatus).toBe(true);
  });

  it("startRoll moves to rolling", () => {
    const { result } = renderHook(() => useRollActions());

    act(() => result.current.startRoll());
    expect(useRollStore.getState().status).toBe("rolling");
  });

  it("finishRoll moves to picking", () => {
    const { result } = renderHook(() => useRollActions());

    act(() => result.current.startRoll());
    act(() => result.current.finishRoll());
    expect(useRollStore.getState().status).toBe("picking");
  });

  it("reroll moves to rolling and marks reroll as used", () => {
    const { result } = renderHook(() => useRollActions());

    act(() => result.current.reroll());
    expect(useRollStore.getState().status).toBe("rolling");
    expect(useRollStore.getState().rerollStatus).toBe(false);
  });

  it("a second reroll is a no-op", () => {
    const { result } = renderHook(() => useRollActions());

    act(() => result.current.reroll());
    const afterFirst = useRollStore.getState();

    act(() => result.current.reroll());

    expect(useRollStore.getState().rerollStatus).toBe(false);
    expect(useRollStore.getState().status).toBe(afterFirst.status);
  });

  it("reset restores initial state from any phase", () => {
    const { result } = renderHook(() => useRollActions());

    act(() => result.current.reroll());
    act(() => result.current.reset());

    expect(useRollStore.getState().status).toBe("idle");
    expect(useRollStore.getState().rerollStatus).toBe(true);
  });

  it("selector hooks rerender with the store", () => {
    const statusHook = renderHook(() => useStatus());
    const rerollHook = renderHook(() => useRerollStatus());

    act(() => useRollStore.getState().actions.reroll());

    expect(statusHook.result.current).toBe("rolling");
    expect(rerollHook.result.current).toBe(false);
  });
});
