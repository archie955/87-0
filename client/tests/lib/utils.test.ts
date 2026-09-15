import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "", "b")).toBe("a b");
  });

  it("supports conditional object syntax (clsx)", () => {
    expect(cn("base", { active: true, inactive: false })).toBe("base active");
  });

  it("lets later tailwind classes override earlier ones", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
