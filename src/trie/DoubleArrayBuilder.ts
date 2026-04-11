/**
 * Builds a double array trie from a set of sorted keys.
 *
 * The double array structure uses two parallel arrays (base and check)
 * to represent a trie compactly. This is the standard Aoe algorithm.
 */

export interface DoubleArrayBuildResult {
  base: Int32Array;
  check: Int32Array;
}

interface TrieNode {
  code: number;
  children: TrieNode[];
  isTerminal: boolean;
  value: number;
}

const ROOT_CODE = 0;
const LEAF_CODE = -1;
const BASE_INITIAL = 1;
const CHECK_EMPTY = 0;

export class DoubleArrayBuilder {
  /**
   * Build a double array from sorted key-value pairs.
   * Keys must be sorted in lexicographic order.
   * Each key is an array of character codes (unsigned integers > 0).
   */
  static build(keys: { key: number[]; value: number }[]): DoubleArrayBuildResult {
    const builder = new DoubleArrayBuilder();
    return builder.buildFromKeys(keys);
  }

  private base: Int32Array;
  private check: Int32Array;
  private nextCheckPos: number;

  constructor() {
    this.base = new Int32Array(0);
    this.check = new Int32Array(0);
    this.nextCheckPos = 0;
  }

  private buildFromKeys(
    keys: { key: number[]; value: number }[]
  ): DoubleArrayBuildResult {
    if (keys.length === 0) {
      return { base: new Int32Array(1), check: new Int32Array(1) };
    }

    // Build intermediate trie
    const root = this.buildTrie(keys);

    // Initial allocation
    const initialSize = Math.max(keys.length * 4, 1024);
    this.base = new Int32Array(initialSize);
    this.check = new Int32Array(initialSize);
    this.nextCheckPos = 0;

    // Root node at position 0
    this.base[0] = BASE_INITIAL;

    // Recursively insert children
    const children = root.children;
    if (children.length > 0) {
      this.insert(children, 0);
    }

    // Trim to used size
    let usedSize = 0;
    for (let i = this.base.length - 1; i >= 0; i--) {
      if (this.base[i] !== 0 || this.check[i] !== 0) {
        usedSize = i + 1;
        break;
      }
    }
    usedSize = Math.max(usedSize, 1);

    return {
      base: this.base.slice(0, usedSize),
      check: this.check.slice(0, usedSize),
    };
  }

  private buildTrie(keys: { key: number[]; value: number }[]): TrieNode {
    const root: TrieNode = {
      code: ROOT_CODE,
      children: [],
      isTerminal: false,
      value: -1,
    };

    for (const { key, value } of keys) {
      let node = root;
      for (const code of key) {
        let child = node.children.find((c) => c.code === code);
        if (!child) {
          child = {
            code,
            children: [],
            isTerminal: false,
            value: -1,
          };
          node.children.push(child);
        }
        node = child;
      }
      // Add terminal marker
      const terminal: TrieNode = {
        code: LEAF_CODE,
        children: [],
        isTerminal: true,
        value,
      };
      // Insert terminal at beginning of children
      node.children.unshift(terminal);
    }

    return root;
  }

  private ensureSize(size: number): void {
    if (size <= this.base.length) return;
    let newSize = this.base.length;
    while (newSize < size) {
      newSize = Math.max(newSize * 2, 1024);
    }
    const newBase = new Int32Array(newSize);
    const newCheck = new Int32Array(newSize);
    newBase.set(this.base);
    newCheck.set(this.check);
    this.base = newBase;
    this.check = newCheck;
  }

  private insert(siblings: TrieNode[], parentIdx: number): void {
    // Find codes for siblings. Terminal nodes use code 0.
    const codes = siblings.map((s) => (s.code === LEAF_CODE ? 0 : s.code));

    // Find a base value where all children fit
    let begin = Math.max(codes[0] + 1, this.nextCheckPos) - codes[0];
    let nonZeroCount = 0;
    let isFirst = true;

    outer: while (true) {
      begin++;
      this.ensureSize(begin + codes[codes.length - 1] + 1);

      if (this.check[begin + codes[0]] !== CHECK_EMPTY) {
        nonZeroCount++;
        continue;
      }
      if (isFirst) {
        this.nextCheckPos = begin + codes[0];
        isFirst = false;
      }

      for (let i = 1; i < codes.length; i++) {
        if (this.check[begin + codes[i]] !== CHECK_EMPTY) {
          continue outer;
        }
      }
      break;
    }

    // Advance nextCheckPos heuristic
    if (nonZeroCount / (begin - this.nextCheckPos + 1) >= 0.95) {
      this.nextCheckPos = begin + codes[0];
    }

    this.base[parentIdx] = begin;

    // First pass: set check values for all siblings
    for (let i = 0; i < siblings.length; i++) {
      const pos = begin + codes[i];
      this.ensureSize(pos + 1);
      this.check[pos] = parentIdx + 1; // check stores parent+1 (0 means empty)
    }

    // Second pass: set base values and recurse
    for (let i = 0; i < siblings.length; i++) {
      const pos = begin + codes[i];

      if (siblings[i].isTerminal) {
        // Terminal: store negative value - 1 in base
        this.base[pos] = -siblings[i].value - 1;
      } else if (siblings[i].children.length > 0) {
        this.insert(siblings[i].children, pos);
      }
    }
  }
}
