/**
 * Unknown word dictionary.
 * Handles words not found in the main dictionary by using character type information.
 */

import { CharacterDefinition } from "./CharacterDefinition.js";
import { TokenInfoDictionary } from "./TokenInfoDictionary.js";

export class UnknownDictionary extends TokenInfoDictionary {
  private characterDefinition: CharacterDefinition;
  private classIdToWordIds: Record<number, number[]> | null;

  constructor() {
    super();
    this.characterDefinition = new CharacterDefinition();
    this.classIdToWordIds = null;
  }

  setCharacterDefinition(charDef: CharacterDefinition): void {
    this.characterDefinition = charDef;
  }

  getCharacterDefinition(): CharacterDefinition {
    return this.characterDefinition;
  }

  /**
   * Lookup unknown word entries for a given character class.
   * Returns word IDs for the given character class index.
   */
  lookup(charCode: number): number[] {
    return this.lookupByCharClass(
      this.characterDefinition.getCharacterClass(charCode)
    );
  }

  /**
   * Lookup word IDs by character class index.
   */
  lookupByCharClass(classId: number): number[] {
    if (this.classIdToWordIds) {
      return this.classIdToWordIds[classId] ?? [];
    }

    const map = this.getTargetMap();
    const ids: number[] = [];
    for (const key of Object.keys(map)) {
      const wordId = Number(key);
      const features = this.getFeatures(wordId);
      if (features !== "") {
        ids.push(wordId);
      }
    }
    return ids;
  }

  override loadPosVector(data: Uint8Array): this {
    if (data.byteLength === 0) {
      this.classIdToWordIds = null;
      return this;
    }

    const view = new DataView(
      data.buffer,
      data.byteOffset,
      data.byteLength
    );
    const classCount = view.getInt32(0, true);
    const map: Record<number, number[]> = {};
    let offset = 4;
    for (let classId = 0; classId < classCount; classId++) {
      const wordIdCount = view.getInt32(offset, true);
      offset += 4;
      const wordIds: number[] = [];
      for (let i = 0; i < wordIdCount; i++) {
        wordIds.push(view.getInt32(offset, true));
        offset += 4;
      }
      map[classId] = wordIds;
    }
    this.classIdToWordIds = map;
    return this;
  }

  /**
   * Load from category map and dictionary data.
   */
  loadCharacterDefinition(charDef: CharacterDefinition): this {
    this.characterDefinition = charDef;
    return this;
  }
}
