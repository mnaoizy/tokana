/**
 * Builds a Viterbi lattice from input text using the trie and dictionaries.
 */

import type { DoubleArray } from "../trie/DoubleArray.js";
import type { TokenInfoDictionary } from "../dict/TokenInfoDictionary.js";
import type { UnknownDictionary } from "../dict/UnknownDictionary.js";
import { ViterbiNode } from "./ViterbiNode.js";
import { ViterbiLattice } from "./ViterbiLattice.js";

export class ViterbiBuilder {
  private readonly trie: DoubleArray;
  private readonly tokenInfoDictionary: TokenInfoDictionary;
  private readonly unknownDictionary: UnknownDictionary;

  constructor(
    trie: DoubleArray,
    tokenInfoDictionary: TokenInfoDictionary,
    unknownDictionary: UnknownDictionary
  ) {
    this.trie = trie;
    this.tokenInfoDictionary = tokenInfoDictionary;
    this.unknownDictionary = unknownDictionary;
  }

  /**
   * Build a Viterbi lattice for the given input text.
   */
  build(text: string): ViterbiLattice {
    const lattice = new ViterbiLattice(text.length);
    const charDef = this.unknownDictionary.getCharacterDefinition();

    for (let i = 0; i < text.length; i = nextCodePointPosition(text, i)) {
      const suffix = text.substring(i);

      // Search known words using trie
      const matches = this.trie.commonPrefixSearch(suffix);
      let hasKnownWord = false;

      for (const match of matches) {
        if (match.length === 0) continue;
        hasKnownWord = true;
        const surface = text.substring(i, i + match.length);

        for (const wordId of this.tokenInfoDictionary.getWordIds(match.value)) {
          const node = new ViterbiNode(
            wordId,
            this.tokenInfoDictionary.getWordCost(wordId),
            i,
            match.length,
            this.tokenInfoDictionary.getLeftId(wordId),
            this.tokenInfoDictionary.getRightId(wordId),
            "KNOWN",
            surface
          );
          lattice.addNode(node);
        }
      }

      // Process unknown words
      const charCode = codePointAt(text, i);
      const isInvoke = charDef.isInvoke(charCode);

      // Add unknown word nodes if:
      // 1. No known word was found, OR
      // 2. The character class has invoke=true
      if (!hasKnownWord || isInvoke) {
        this.addUnknownNodes(lattice, text, i, charDef);
      }
    }

    return lattice;
  }

  private addUnknownNodes(
    lattice: ViterbiLattice,
    text: string,
    pos: number,
    charDef: import("../dict/CharacterDefinition.js").CharacterDefinition
  ): void {
    const charCode = codePointAt(text, pos);
    const classId = charDef.getCharacterClass(charCode);
    const isGroup = charDef.isGroup(charCode);
    const maxLength = charDef.getMaxLength(charCode);

    // Get unknown word entries for this character class
    const wordIds = this.unknownDictionary.lookup(charCode);

    if (wordIds.length === 0) return;

    // If group flag is set, try to group consecutive same-class characters
    if (isGroup) {
      let endPos = nextCodePointPosition(text, pos);
      while (endPos < text.length) {
        const nextClass = charDef.getCharacterClass(codePointAt(text, endPos));
        if (nextClass !== classId) break;
        endPos = nextCodePointPosition(text, endPos);
      }

      const surface = text.substring(pos, endPos);
      for (const wordId of wordIds) {
        const node = new ViterbiNode(
          wordId,
          this.unknownDictionary.getWordCost(wordId),
          pos,
          surface.length,
          this.unknownDictionary.getLeftId(wordId),
          this.unknownDictionary.getRightId(wordId),
          "UNKNOWN",
          surface
        );
        lattice.addNode(node);
      }
    }

    // Also try individual character lengths up to maxLength
    const limit = maxLength > 0 ? maxLength : 1;
    let endPos = pos;
    for (let len = 1; len <= limit && endPos < text.length; len++) {
      if (len > 1) {
        const nextClass = charDef.getCharacterClass(
          codePointAt(text, endPos)
        );
        if (nextClass !== classId) break;
      }
      endPos = nextCodePointPosition(text, endPos);

      const surface = text.substring(pos, endPos);
      for (const wordId of wordIds) {
        // Avoid duplicating the grouped entry
        if (isGroup && len === 1) continue;

        const node = new ViterbiNode(
          wordId,
          this.unknownDictionary.getWordCost(wordId),
          pos,
          surface.length,
          this.unknownDictionary.getLeftId(wordId),
          this.unknownDictionary.getRightId(wordId),
          "UNKNOWN",
          surface
        );
        lattice.addNode(node);
      }
    }

    // If no nodes were added (non-group, maxLength=0), add single character
    if (!isGroup && maxLength === 0) {
      const surface = text.substring(pos, nextCodePointPosition(text, pos));
      for (const wordId of wordIds) {
        const node = new ViterbiNode(
          wordId,
          this.unknownDictionary.getWordCost(wordId),
          pos,
          surface.length,
          this.unknownDictionary.getLeftId(wordId),
          this.unknownDictionary.getRightId(wordId),
          "UNKNOWN",
          surface
        );
        lattice.addNode(node);
      }
    }
  }
}

function codePointAt(text: string, pos: number): number {
  return text.codePointAt(pos) ?? text.charCodeAt(pos);
}

function nextCodePointPosition(text: string, pos: number): number {
  const code = text.codePointAt(pos);
  return pos + (code !== undefined && code > 0xffff ? 2 : 1);
}
