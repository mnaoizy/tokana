import { describe, it, expect } from "vitest";
import { DoubleArray } from "../../src/trie/DoubleArray.js";
import { DoubleArrayBuilder } from "../../src/trie/DoubleArrayBuilder.js";

describe("DoubleArrayBuilder", () => {
  it("should build from empty keys", () => {
    const result = DoubleArrayBuilder.build([]);
    expect(result.base).toBeInstanceOf(Int32Array);
    expect(result.check).toBeInstanceOf(Int32Array);
  });

  it("should build from single key", () => {
    const result = DoubleArrayBuilder.build([
      { key: [97, 98, 99], value: 0 }, // "abc"
    ]);
    expect(result.base.length).toBeGreaterThan(0);
  });

  it("should build from multiple sorted keys", () => {
    const result = DoubleArrayBuilder.build([
      { key: [97], value: 0 }, // "a"
      { key: [97, 98], value: 1 }, // "ab"
      { key: [97, 98, 99], value: 2 }, // "abc"
      { key: [98], value: 3 }, // "b"
    ]);
    expect(result.base.length).toBeGreaterThan(0);
  });
});

describe("DoubleArray", () => {
  it("should perform exact lookup", () => {
    const da = DoubleArray.build([
      { key: "a", value: 0 },
      { key: "ab", value: 1 },
      { key: "abc", value: 2 },
      { key: "b", value: 3 },
      { key: "bc", value: 4 },
    ]);

    expect(da.lookup("a")).toBe(0);
    expect(da.lookup("ab")).toBe(1);
    expect(da.lookup("abc")).toBe(2);
    expect(da.lookup("b")).toBe(3);
    expect(da.lookup("bc")).toBe(4);
    expect(da.lookup("c")).toBe(-1);
    expect(da.lookup("abcd")).toBe(-1);
    expect(da.lookup("")).toBe(-1);
  });

  it("should perform common prefix search", () => {
    const da = DoubleArray.build([
      { key: "a", value: 0 },
      { key: "ab", value: 1 },
      { key: "abc", value: 2 },
    ]);

    const results = da.commonPrefixSearch("abcd");
    expect(results).toEqual([
      { value: 0, length: 1 },
      { value: 1, length: 2 },
      { value: 2, length: 3 },
    ]);
  });

  it("should handle common prefix search with no matches", () => {
    const da = DoubleArray.build([
      { key: "abc", value: 0 },
      { key: "def", value: 1 },
    ]);

    const results = da.commonPrefixSearch("xyz");
    expect(results).toEqual([]);
  });

  it("should handle Japanese characters", () => {
    const da = DoubleArray.build([
      { key: "東", value: 0 },
      { key: "東京", value: 1 },
      { key: "東京都", value: 2 },
    ]);

    expect(da.lookup("東京")).toBe(1);
    expect(da.lookup("東京都")).toBe(2);

    const results = da.commonPrefixSearch("東京都に");
    expect(results).toEqual([
      { value: 0, length: 1 },
      { value: 1, length: 2 },
      { value: 2, length: 3 },
    ]);
  });

  it("should handle supplementary Unicode characters", () => {
    const da = DoubleArray.build([
      { key: "𠮷", value: 0 },
      { key: "𠮷野", value: 1 },
    ]);

    expect(da.lookup("𠮷")).toBe(0);
    expect(da.lookup("𠮷野")).toBe(1);
    expect(da.commonPrefixSearch("𠮷野家")).toEqual([
      { value: 0, length: 2 },
      { value: 1, length: 3 },
    ]);
  });

  it("should serialize and deserialize", () => {
    const original = DoubleArray.build([
      { key: "hello", value: 42 },
      { key: "world", value: 99 },
    ]);

    const base = original.getBase();
    const check = original.getCheck();
    const restored = DoubleArray.fromArrays(
      new Int32Array(base),
      new Int32Array(check)
    );

    expect(restored.lookup("hello")).toBe(42);
    expect(restored.lookup("world")).toBe(99);
    expect(restored.lookup("missing")).toBe(-1);
  });

  it("should handle contain check", () => {
    const da = DoubleArray.build([
      { key: "test", value: 0 },
    ]);
    expect(da.contain("test")).toBe(true);
    expect(da.contain("other")).toBe(false);
  });
});
