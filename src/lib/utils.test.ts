import { describe, it, expect } from "vitest";
import { toggleItem } from "./utils";

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
