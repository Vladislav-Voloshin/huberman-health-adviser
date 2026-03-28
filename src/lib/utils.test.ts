import { describe, it, expect } from "vitest";
import { cn, toggleItem } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });
});

describe("toggleItem", () => {
  it("adds an item not in the list", () => {
    expect(toggleItem([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it("removes an item already in the list", () => {
    expect(toggleItem([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it("works with strings", () => {
    expect(toggleItem(["a", "b"], "c")).toEqual(["a", "b", "c"]);
    expect(toggleItem(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });

  it("returns empty array when toggling off the only item", () => {
    expect(toggleItem(["a"], "a")).toEqual([]);
  });

  it("adds to empty array", () => {
    expect(toggleItem([], "x")).toEqual(["x"]);
  });
});
