import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  useNotificationStore,
  useNotificationActions,
  useNotificationMessage,
  useNotificationOpen,
  useNotificationSeverity,
} from "@/stores/notificationStore";

const reset = () => {
  useNotificationStore.setState({
    notification: null,
    open: false,
    severity: "success",
  });
};

describe("notificationStore", () => {
  beforeEach(() => {
    reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with no notification, closed, severity success", () => {
    const s = useNotificationStore.getState();
    expect(s.notification).toBeNull();
    expect(s.open).toBe(false);
    expect(s.severity).toBe("success");
  });

  it("setNotification opens with the message and severity", () => {
    const { result } = renderHook(() => useNotificationActions());

    act(() => {
      result.current.setNotification("Saved", "success");
    });

    const s = useNotificationStore.getState();
    expect(s.notification).toBe("Saved");
    expect(s.open).toBe(true);
    expect(s.severity).toBe("success");
  });

  it("auto-closes after 5 seconds", () => {
    const { result } = renderHook(() => useNotificationActions());

    act(() => result.current.setNotification("Bye soon", "info"));
    expect(useNotificationStore.getState().open).toBe(true);

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(useNotificationStore.getState().open).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(useNotificationStore.getState().open).toBe(false);
    expect(useNotificationStore.getState().notification).toBeNull();
    expect(useNotificationStore.getState().severity).toBe("success");
  });

  it("manualClose clears the state and cancels nothing if fired early", () => {
    const { result } = renderHook(() => useNotificationActions());

    act(() => result.current.setNotification("Nope", "error"));
    act(() => result.current.manualClose());

    expect(useNotificationStore.getState().open).toBe(false);
    expect(useNotificationStore.getState().notification).toBeNull();
    expect(useNotificationStore.getState().severity).toBe("success");
  });

  it("supports each severity value", () => {
    const { result } = renderHook(() => useNotificationActions());
    const severities = ["success", "info", "warning", "error"] as const;

    for (const sev of severities) {
      act(() => result.current.setNotification("msg", sev));
      expect(useNotificationStore.getState().severity).toBe(sev);
    }
  });

  it("selector hooks reflect state changes", () => {
    const messageHook = renderHook(() => useNotificationMessage());
    const openHook = renderHook(() => useNotificationOpen());
    const severityHook = renderHook(() => useNotificationSeverity());

    act(() => {
      useNotificationStore
        .getState()
        .actions.setNotification("warn", "warning");
    });

    expect(messageHook.result.current).toBe("warn");
    expect(openHook.result.current).toBe(true);
    expect(severityHook.result.current).toBe("warning");
  });
});
