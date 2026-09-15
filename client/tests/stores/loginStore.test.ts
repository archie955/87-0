import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  useLoginStore,
  useLogin,
  useShow,
  useChangeActions,
} from "@/stores/loginStore";

const reset = () => {
  useLoginStore.setState({ login: true, show: false });
};

describe("loginStore", () => {
  beforeEach(reset);

  it("starts with login=true and show=false", () => {
    const state = useLoginStore.getState();
    expect(state.login).toBe(true);
    expect(state.show).toBe(false);
  });

  it("changeLogin toggles the login/register view both ways", () => {
    const { result } = renderHook(() => useChangeActions());

    act(() => result.current.changeLogin());
    expect(useLoginStore.getState().login).toBe(false);

    act(() => result.current.changeLogin());
    expect(useLoginStore.getState().login).toBe(true);
  });

  it("changeShow toggles the show flag both ways", () => {
    const { result } = renderHook(() => useChangeActions());

    act(() => result.current.changeShow());
    expect(useLoginStore.getState().show).toBe(true);

    act(() => result.current.changeShow());
    expect(useLoginStore.getState().show).toBe(false);
  });

  it("useLogin and useShow rerender with the store", () => {
    const loginHook = renderHook(() => useLogin());
    const showHook = renderHook(() => useShow());

    act(() => {
      useLoginStore.getState().actions.changeLogin();
      useLoginStore.getState().actions.changeShow();
    });

    expect(loginHook.result.current).toBe(false);
    expect(showHook.result.current).toBe(true);
  });
});
