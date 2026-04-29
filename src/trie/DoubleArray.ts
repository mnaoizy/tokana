/**
 * Double Array Trie for efficient prefix matching.
 * Supports exact lookup and common prefix search.
 */

import { DoubleArrayBuilder } from "./DoubleArrayBuilder.js";

export interface KeyValue {
  /** The value associated with the key */
  value: number;
  /** Length of the matched key (in code units) */
  length: number;
}

export class DoubleArray {
  private base: Int32Array;
  private check: Int32Array;

  constructor(base?: Int32Array, check?: Int32Array) {
    this.base = base ?? new Int32Array(0);
    this.check = check ?? new Int32Array(0);
  }

  /**
   * Build a DoubleArray from sorted string keys.
   * Keys must be sorted lexicographically.
   */
  static build(keys: { key: string; value: number }[]): DoubleArray {
    const encoded = keys.map(({ key, value }) => ({
      key: Array.from(key).map((ch) => ch.codePointAt(0) ?? 0),
      value,
    }));
    const { base, check } = DoubleArrayBuilder.build(encoded);
    return new DoubleArray(base, check);
  }

  /**
   * Exact lookup of a key string.
   * Returns the associated value, or -1 if not found.
   */
  lookup(key: string): number {
    let pos = 0;
    let baseVal = this.base[0];

    for (let i = 0; i < key.length; ) {
      const code = key.codePointAt(i);
      if (code === undefined) return -1;
      const next = baseVal + code;

      if (next >= this.check.length || this.check[next] !== pos + 1) {
        return -1;
      }
      pos = next;
      baseVal = this.base[pos];
      i += code > 0xffff ? 2 : 1;
    }

    // Check for terminal (code 0)
    const termPos = baseVal; // base + 0
    if (
      termPos >= 0 &&
      termPos < this.check.length &&
      this.check[termPos] === pos + 1
    ) {
      const v = this.base[termPos];
      if (v < 0) {
        return -v - 1;
      }
    }
    return -1;
  }

  /**
   * Find all keys that are prefixes of the given string.
   * Returns values and their matched lengths.
   */
  commonPrefixSearch(key: string): KeyValue[] {
    const results: KeyValue[] = [];
    let pos = 0;
    let baseVal = this.base[0];

    for (let i = 0; i < key.length; ) {
      // Check for terminal at current position
      const termPos = baseVal; // base + 0
      if (
        termPos >= 0 &&
        termPos < this.check.length &&
        this.check[termPos] === pos + 1
      ) {
        const v = this.base[termPos];
        if (v < 0) {
          results.push({ value: -v - 1, length: i });
        }
      }

      const code = key.codePointAt(i);
      if (code === undefined) return results;
      const next = baseVal + code;

      if (next < 0 || next >= this.check.length || this.check[next] !== pos + 1) {
        return results;
      }
      pos = next;
      baseVal = this.base[pos];
      i += code > 0xffff ? 2 : 1;
    }

    // Check for terminal at the end
    const termPos = baseVal;
    if (
      termPos >= 0 &&
      termPos < this.check.length &&
      this.check[termPos] === pos + 1
    ) {
      const v = this.base[termPos];
      if (v < 0) {
        results.push({ value: -v - 1, length: key.length });
      }
    }

    return results;
  }

  /**
   * Check if any key exists that starts with the given prefix.
   */
  contain(key: string): boolean {
    return this.lookup(key) !== -1;
  }

  /**
   * Get the raw base array (for serialization).
   */
  getBase(): Int32Array {
    return this.base;
  }

  /**
   * Get the raw check array (for serialization).
   */
  getCheck(): Int32Array {
    return this.check;
  }

  /**
   * Create a DoubleArray from raw base and check arrays (for deserialization).
   */
  static fromArrays(base: Int32Array, check: Int32Array): DoubleArray {
    return new DoubleArray(base, check);
  }
}
