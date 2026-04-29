/**
 * Token information dictionary.
 * Stores morpheme features (POS, reading, pronunciation, etc.)
 * indexed by word ID.
 */
import { ByteBuffer } from "../util/ByteBuffer.js";

export class TokenInfoDictionary {
  /** Feature data for each word, stored as concatenated strings */
  private dictionary: ByteBuffer;

  /** Mapping from word ID to position in features buffer */
  private targetMap: Record<number, number>;
  /** Mapping from the first word ID for a trie hit to the number of candidate entries */
  private wordIdGroupCounts: Record<number, number>;

  constructor() {
    this.dictionary = new ByteBuffer(1024 * 1024);
    this.targetMap = {};
    this.wordIdGroupCounts = {};
  }

  buildDictionary(entries: { wordId: number; leftId: number; rightId: number; cost: number }[]): {
    wordId: number;
    leftId: number;
    rightId: number;
    cost: number;
  }[] {
    return entries;
  }

  /**
   * Add a token entry to the dictionary.
   */
  put(wordId: number, leftId: number, rightId: number, cost: number, features: string): void {
    const pos = this.dictionary.getPosition();
    this.targetMap[wordId] = pos;

    // Store: leftId(2) + rightId(2) + cost(2) + features_length(2) + features
    this.dictionary.putInt16(leftId);
    this.dictionary.putInt16(rightId);
    this.dictionary.putInt16(cost);
    this.dictionary.putInt16(features.length);
    this.dictionary.putString(features);
  }

  /**
   * Add a mapping from word ID to buffer position.
   */
  addMapping(wordId: number, position: number): void {
    this.targetMap[wordId] = position;
  }

  /**
   * Get left context ID for a word.
   */
  getLeftId(wordId: number): number {
    const pos = this.targetMap[wordId];
    if (pos === undefined) return -1;
    return this.dictionary.getInt16(pos);
  }

  /**
   * Get right context ID for a word.
   */
  getRightId(wordId: number): number {
    const pos = this.targetMap[wordId];
    if (pos === undefined) return -1;
    return this.dictionary.getInt16(pos + 2);
  }

  /**
   * Get word cost for a word.
   */
  getWordCost(wordId: number): number {
    const pos = this.targetMap[wordId];
    if (pos === undefined) return -1;
    return this.dictionary.getInt16(pos + 4);
  }

  /**
   * Get feature string for a word.
   */
  getFeatures(wordId: number): string {
    const pos = this.targetMap[wordId];
    if (pos === undefined) return "";
    const len = this.dictionary.getInt16(pos + 6);
    const saved = this.dictionary.getPosition();
    this.dictionary.setPosition(pos + 8);
    const str = this.dictionary.readString(len);
    this.dictionary.setPosition(saved);
    return str;
  }

  /**
   * Load the dictionary data buffer.
   */
  loadDictionary(data: Uint8Array): this {
    this.dictionary = new ByteBuffer(data);
    return this;
  }

  /**
   * Load the position data buffer.
   */
  loadPosVector(_data: Uint8Array): this {
    if (_data.byteLength === 0) {
      this.wordIdGroupCounts = {};
      return this;
    }

    const view = new DataView(
      _data.buffer,
      _data.byteOffset,
      _data.byteLength
    );
    const count = view.getInt32(0, true);
    const groupCounts: Record<number, number> = {};
    for (let i = 0; i < count; i++) {
      const offset = 4 + i * 8;
      const firstWordId = view.getInt32(offset, true);
      const entryCount = view.getInt32(offset + 4, true);
      if (entryCount > 0) {
        groupCounts[firstWordId] = entryCount;
      }
    }
    this.wordIdGroupCounts = groupCounts;
    return this;
  }

  /**
   * Get all candidate word IDs associated with a trie hit.
   */
  getWordIds(firstWordId: number): number[] {
    const count = this.wordIdGroupCounts[firstWordId] ?? 1;
    const wordIds: number[] = [];
    for (let i = 0; i < count; i++) {
      const wordId = firstWordId + i;
      if (this.targetMap[wordId] !== undefined) {
        wordIds.push(wordId);
      }
    }
    return wordIds;
  }

  /**
   * Load the target map buffer.
   * Format: sequence of int32 pairs [wordId, position]
   */
  loadTargetMap(data: Uint8Array): this {
    const view = new DataView(
      data.buffer,
      data.byteOffset,
      data.byteLength
    );
    this.targetMap = {};
    const count = view.getInt32(0, true);
    for (let i = 0; i < count; i++) {
      const offset = 4 + i * 4;
      const pos = view.getInt32(offset, true);
      this.targetMap[i] = pos;
    }
    return this;
  }

  getDictionary(): ByteBuffer {
    return this.dictionary;
  }

  getTargetMap(): Record<number, number> {
    return this.targetMap;
  }

  getTargetMapData(): Uint8Array {
    const ids = Object.keys(this.targetMap)
      .map(Number)
      .sort((a, b) => a - b);
    const maxId = ids.length > 0 ? ids[ids.length - 1] : -1;
    const buf = new ByteBuffer(4 + (maxId + 1) * 4);
    buf.putInt32(maxId + 1);
    for (let i = 0; i <= maxId; i++) {
      buf.putInt32(this.targetMap[i] ?? -1);
    }
    return buf.shrink();
  }
}
