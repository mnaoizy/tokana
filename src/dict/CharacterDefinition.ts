/**
 * Character type definition for unknown word processing.
 * Maps Unicode characters to character classes used in MeCab's char.def.
 */

import type { CharacterClass } from "../types/dictionary.js";

const DEFAULT_CATEGORY = 0;

export const CHARACTER_CATEGORY_NAMES = [
  "DEFAULT",
  "SPACE",
  "KANJI",
  "SYMBOL",
  "NUMERIC",
  "ALPHA",
  "HIRAGANA",
  "KATAKANA",
  "KANJINUMERIC",
  "GREEK",
  "CYRILLIC",
] as const;

export type CharacterCategoryName =
  (typeof CHARACTER_CATEGORY_NAMES)[number];

export class CharacterDefinition {
  /** Character class definitions */
  private characterClasses: CharacterClass[];

  /** Mapping from character code to class index */
  private characterCategoryMap: Uint8Array;

  /** Mapping from character code to compatible class bitmask */
  private compatibleCategoryMap: Uint32Array;

  constructor() {
    this.characterClasses = [];
    // Support BMP only (0x0000 - 0xFFFF)
    this.characterCategoryMap = new Uint8Array(65536);
    this.compatibleCategoryMap = new Uint32Array(65536);
  }

  addCharacterClass(charClass: CharacterClass): number {
    const id = this.characterClasses.length;
    this.characterClasses.push(charClass);
    return id;
  }

  setCharacterCategory(
    start: number,
    end: number,
    classId: number,
    compatibleClasses: number[]
  ): void {
    for (let i = start; i <= end; i++) {
      this.characterCategoryMap[i] = classId;
      let compat = 0;
      for (const c of compatibleClasses) {
        compat |= 1 << c;
      }
      this.compatibleCategoryMap[i] = compat;
    }
  }

  /**
   * Lookup the character class for a given character code.
   */
  lookup(charCode: number): CharacterClass {
    const classId =
      charCode < 65536 ? this.characterCategoryMap[charCode] : DEFAULT_CATEGORY;
    return this.characterClasses[classId] ?? this.characterClasses[0];
  }

  /**
   * Get the character class index for a character code.
   */
  getCharacterClass(charCode: number): number {
    return charCode < 65536 ? this.characterCategoryMap[charCode] : DEFAULT_CATEGORY;
  }

  /**
   * Check if two character codes are in compatible classes.
   */
  isCompatible(charCode1: number, charCode2: number): boolean {
    const class2 = this.getCharacterClass(charCode2);
    const compat = this.compatibleCategoryMap[charCode1] ?? 0;
    return (compat & (1 << class2)) !== 0;
  }

  /**
   * Get the invoke flag for a character class.
   */
  isInvoke(charCode: number): boolean {
    const classId = this.getCharacterClass(charCode);
    const cls = this.characterClasses[classId];
    return cls ? cls.invoke : false;
  }

  /**
   * Get the group flag for a character class.
   */
  isGroup(charCode: number): boolean {
    const classId = this.getCharacterClass(charCode);
    const cls = this.characterClasses[classId];
    return cls ? cls.group : false;
  }

  /**
   * Get the max length for a character class.
   */
  getMaxLength(charCode: number): number {
    const classId = this.getCharacterClass(charCode);
    const cls = this.characterClasses[classId];
    return cls ? cls.length : 0;
  }

  getCharacterClasses(): CharacterClass[] {
    return this.characterClasses;
  }

  getCategoryMap(): Uint8Array {
    return this.characterCategoryMap;
  }

  getCompatibleCategoryMap(): Uint32Array {
    return this.compatibleCategoryMap;
  }

  /**
   * Load from binary buffers.
   */
  static fromBuffers(
    categoryMap: Uint8Array,
    compatMap: Uint32Array,
    invokeDefBuf: Uint8Array
  ): CharacterDefinition {
    const def = new CharacterDefinition();
    def.characterCategoryMap = categoryMap;
    def.compatibleCategoryMap = compatMap;

    // invokeDefBuf: [count(4bytes), then for each class: invoke(1), group(1), length(4)]
    const view = new DataView(
      invokeDefBuf.buffer,
      invokeDefBuf.byteOffset,
      invokeDefBuf.byteLength
    );
    const count = view.getInt32(0, true);
    for (let i = 0; i < count; i++) {
      const offset = 4 + i * 6;
      const invoke = view.getUint8(offset) === 1;
      const group = view.getUint8(offset + 1) === 1;
      const length = view.getInt32(offset + 2, true);
      def.characterClasses.push({
        name: CHARACTER_CATEGORY_NAMES[i] ?? `CLASS_${i}`,
        invoke,
        group,
        length,
      });
    }

    return def;
  }

  /**
   * Serialize invoke definitions to buffer.
   */
  toInvokeBuffer(): Uint8Array {
    const count = this.characterClasses.length;
    const buf = new Uint8Array(4 + count * 6);
    const view = new DataView(buf.buffer);
    view.setInt32(0, count, true);
    for (let i = 0; i < count; i++) {
      const cls = this.characterClasses[i];
      const offset = 4 + i * 6;
      view.setUint8(offset, cls.invoke ? 1 : 0);
      view.setUint8(offset + 1, cls.group ? 1 : 0);
      view.setInt32(offset + 2, cls.length, true);
    }
    return buf;
  }
}
