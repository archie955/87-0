import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ChangeEvent } from "react";
import useField from "@/hooks/useField";

describe("useField", () => {
  it("initialises empty with the requested input type", () => {
    const { result } = renderHook(() => useField("email"));
    expect(result.current.type).toBe("email");
    expect(result.current.value).toBe("");
  });

  it("updates value from a change event", () => {
    const { result } = renderHook(() => useField("text"));

    act(() => {
      result.current.onChange({
        target: { value: "hello" },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.value).toBe("hello");
  });

  it("overwrites the value on subsequent changes", () => {
    const { result } = renderHook(() => useField("password"));

    act(() => {
      result.current.onChange({
        target: { value: "first" },
      } as ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.onChange({
        target: { value: "second" },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.value).toBe("second");
  });

  it("supports each input type", () => {
    const types = ["text", "password", "email", "number"] as const;
    for (const t of types) {
      const { result } = renderHook(() => useField(t));
      expect(result.current.type).toBe(t);
    }
  });
});
