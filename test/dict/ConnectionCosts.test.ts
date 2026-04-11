import { describe, it, expect } from "vitest";
import { ConnectionCosts } from "../../src/dict/ConnectionCosts.js";

describe("ConnectionCosts", () => {
  it("should store and retrieve costs", () => {
    const cc = new ConnectionCosts(3, 3);
    cc.put(0, 1, 100);
    cc.put(1, 2, 200);
    cc.put(2, 0, -50);

    expect(cc.get(0, 1)).toBe(100);
    expect(cc.get(1, 2)).toBe(200);
    expect(cc.get(2, 0)).toBe(-50);
    expect(cc.get(0, 0)).toBe(0); // default
  });

  it("should report sizes", () => {
    const cc = new ConnectionCosts(10, 20);
    expect(cc.getForwardSize()).toBe(10);
    expect(cc.getBackwardSize()).toBe(20);
  });

  it("should serialize and deserialize", () => {
    const cc = new ConnectionCosts(3, 4);
    cc.put(0, 0, 10);
    cc.put(1, 2, 20);
    cc.put(2, 3, -30);

    const buffer = cc.toBuffer();
    const restored = ConnectionCosts.fromBuffer(buffer);

    expect(restored.getForwardSize()).toBe(3);
    expect(restored.getBackwardSize()).toBe(4);
    expect(restored.get(0, 0)).toBe(10);
    expect(restored.get(1, 2)).toBe(20);
    expect(restored.get(2, 3)).toBe(-30);
  });
});
