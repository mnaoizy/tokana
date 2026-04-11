/**
 * Unknown word dictionary.
 * Handles words not found in the main dictionary by using character type information.
 */

import { CharacterDefinition } from "./CharacterDefinition.js";
import { TokenInfoDictionary } from "./TokenInfoDictionary.js";

export class UnknownDictionary extends TokenInfoDictionary {
  private characterDefinition: CharacterDefinition;

  constructor() {
    super();
    this.characterDefinition = new CharacterDefinition();
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
  lookupByCharClass(_classId: number): number[] {
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

  /**
   * Load from category map and dictionary data.
   */
  loadCharacterDefinition(charDef: CharacterDefinition): this {
    this.characterDefinition = charDef;
    return this;
  }
}
