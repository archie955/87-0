import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useIsMobile } from "@/hooks/useMobile";

let listeners: Array<() => void> = [];

const installMatchMedia = () => {
  listeners = [];
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: (_: string, cb: () => void) => {
        listeners.push(cb);
      },
      removeEventListener: (_: string, cb: () => void) => {
        listeners = listeners.filter((l) => l !== cb);
      },
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
};

const setWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
};

describe("useIsMobile", () => {
  beforeEach(() => {
    installMatchMedia();
  });

  afterEach(() => {
    listeners = [];
    vi.restoreAllMocks();
  });

  it("returns false on a desktop-width viewport", () => {
    setWidth(1280);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true on a mobile-width viewport", () => {
    setWidth(500);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("re-evaluates when the media query change fires", () => {
    setWidth(1280);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    setWidth(500);
    act(() => {
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(true);

    setWidth(1280);
    act(() => {
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(false);
  });

  it("cleans up its listener on unmount", () => {
    setWidth(500);
    const { unmount } = renderHook(() => useIsMobile());
    expect(listeners.length).toBe(1);

    unmount();
    expect(listeners.length).toBe(0);
  });
});
