import { describe, it, expect } from "vitest";
import { ByteBuffer } from "../../src/util/ByteBuffer.js";

describe("ByteBuffer", () => {
  it("should write and read int8", () => {
    const buf = new ByteBuffer(16);
    buf.putInt8(42);
    buf.putInt8(-128);
    expect(buf.getInt8(0)).toBe(42);
    expect(buf.getInt8(1)).toBe(-128);
  });

  it("should write and read int16 (little-endian)", () => {
    const buf = new ByteBuffer(16);
    buf.putInt16(1234);
    buf.putInt16(-5678);
    expect(buf.getInt16(0)).toBe(1234);
    expect(buf.getInt16(2)).toBe(-5678);
  });

  it("should write and read int32 (little-endian)", () => {
    const buf = new ByteBuffer(16);
    buf.putInt32(123456789);
    buf.putInt32(-987654321);
    expect(buf.getInt32(0)).toBe(123456789);
    expect(buf.getInt32(4)).toBe(-987654321);
  });

  it("should write and read strings", () => {
    const buf = new ByteBuffer(64);
    buf.putString("Hello");
    buf.putString("日本語");

    buf.setPosition(0);
    expect(buf.readString(5)).toBe("Hello");
    expect(buf.readString(3)).toBe("日本語");
  });

  it("should auto-grow capacity", () => {
    const buf = new ByteBuffer(4);
    for (let i = 0; i < 100; i++) {
      buf.putInt32(i);
    }
    expect(buf.size()).toBe(400);
    for (let i = 0; i < 100; i++) {
      expect(buf.getInt32(i * 4)).toBe(i);
    }
  });

  it("should create from Uint8Array", () => {
    const original = new ByteBuffer(16);
    original.putInt32(42);
    original.putInt32(99);

    const data = original.toUint8Array();
    const restored = new ByteBuffer(data);
    expect(restored.getInt32(0)).toBe(42);
    expect(restored.getInt32(4)).toBe(99);
  });

  it("should track position for sequential reads", () => {
    const buf = new ByteBuffer(32);
    buf.putInt8(1);
    buf.putInt16(2);
    buf.putInt32(3);

    buf.setPosition(0);
    expect(buf.readInt8()).toBe(1);
    expect(buf.readInt16()).toBe(2);
    expect(buf.readInt32()).toBe(3);
    expect(buf.getPosition()).toBe(7);
  });

  it("should shrink to used size", () => {
    const buf = new ByteBuffer(1024);
    buf.putInt32(1);
    buf.putInt32(2);
    const shrunk = buf.shrink();
    expect(shrunk.length).toBe(8);
  });
});
