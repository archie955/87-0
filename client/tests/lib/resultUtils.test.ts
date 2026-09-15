import { describe, it, expect } from "vitest";
import { catToDescription } from "@/lib/resultUtils";
import type { Cat } from "@/types/resultTypes";

describe("catToDescription", () => {
  it("returns a distinct description for each category", () => {
    const cats: Cat[] = [
      "cat_1",
      "cat_2",
      "cat_3",
      "cat_4",
      "cat_5",
      "cat_6",
      "cat_7",
    ];
    const descriptions = cats.map(catToDescription);

    for (const d of descriptions) {
      expect(typeof d).toBe("string");
      expect(d.length).toBeGreaterThan(0);
    }

    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("mentions the GOAT framing for cat_1 and the tier-2 framing for cat_6", () => {
    expect(catToDescription("cat_1")).toContain("GOAT");
    expect(catToDescription("cat_6")).toContain("tier 2");
  });

  it("points to the 'easy' toggle for cat_7", () => {
    expect(catToDescription("cat_7")).toContain("easy");
  });

  it("falls through to cat_7 text for an unknown category", () => {
    // @ts-ignore TS2345
    expect(catToDescription("cat_99")).toBe(catToDescription("cat_7"));
  });
});
