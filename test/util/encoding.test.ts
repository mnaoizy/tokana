import { describe, it, expect } from "vitest";
import { decodeAutoDetect } from "../../src/util/encoding.js";

describe("encoding", () => {
  it("should decode UTF-8 data", () => {
    const encoder = new TextEncoder();
    const data = encoder.encode("こんにちは");
    const result = decodeAutoDetect(data);
    expect(result).toBe("こんにちは");
  });

  it("should decode ASCII data", () => {
    const encoder = new TextEncoder();
    const data = encoder.encode("hello");
    const result = decodeAutoDetect(data);
    expect(result).toBe("hello");
  });
});
