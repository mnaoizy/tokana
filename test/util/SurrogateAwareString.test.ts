import { describe, it, expect } from "vitest";
import { SurrogateAwareString } from "../../src/util/SurrogateAwareString.js";

describe("SurrogateAwareString", () => {
  it("should handle basic ASCII strings", () => {
    const s = new SurrogateAwareString("hello");
    expect(s.length).toBe(5);
    expect(s.charAt(0)).toBe("h");
    expect(s.charAt(4)).toBe("o");
    expect(s.toString()).toBe("hello");
  });

  it("should handle Japanese text", () => {
    const s = new SurrogateAwareString("東京都");
    expect(s.length).toBe(3);
    expect(s.charAt(0)).toBe("東");
    expect(s.charAt(1)).toBe("京");
    expect(s.charAt(2)).toBe("都");
    expect(s.substring(0, 2)).toBe("東京");
  });

  it("should handle surrogate pairs", () => {
    // 𠮷 (U+20BB7) is a surrogate pair character
    const s = new SurrogateAwareString("𠮷野家");
    expect(s.length).toBe(3);
    expect(s.charAt(0)).toBe("𠮷");
    expect(s.charAt(1)).toBe("野");
    expect(s.charAt(2)).toBe("家");
  });

  it("should handle mixed content with surrogate pairs", () => {
    const s = new SurrogateAwareString("A𠮷B");
    expect(s.length).toBe(3);
    expect(s.charAt(0)).toBe("A");
    expect(s.charAt(1)).toBe("𠮷");
    expect(s.charAt(2)).toBe("B");
    expect(s.substring(1, 3)).toBe("𠮷B");
  });

  it("should return empty string for out of bounds", () => {
    const s = new SurrogateAwareString("abc");
    expect(s.charAt(-1)).toBe("");
    expect(s.charAt(3)).toBe("");
  });

  it("should return NaN for charCodeAt out of bounds", () => {
    const s = new SurrogateAwareString("abc");
    expect(s.charCodeAt(-1)).toBeNaN();
    expect(s.charCodeAt(3)).toBeNaN();
  });

  it("should handle empty string", () => {
    const s = new SurrogateAwareString("");
    expect(s.length).toBe(0);
    expect(s.toString()).toBe("");
  });
});
