/**
 * Main tokenizer class.
 * Performs Japanese morphological analysis using Viterbi algorithm.
 */

import type { BaseToken } from "../types/token.js";
import type { DictionaryContainer } from "../dict/DictionaryContainer.js";
import type { DictionaryFormat } from "../dict/format/DictionaryFormat.js";
import { ViterbiBuilder } from "../viterbi/ViterbiBuilder.js";
import { ViterbiSearcher } from "../viterbi/ViterbiSearcher.js";

export class Tokenizer<T extends BaseToken = BaseToken> {
  private readonly viterbiBuilder: ViterbiBuilder;
  private readonly viterbiSearcher: ViterbiSearcher;
  private readonly dictionary: DictionaryContainer;
  private readonly format: DictionaryFormat<T>;

  constructor(dictionary: DictionaryContainer, format: DictionaryFormat<T>) {
    this.dictionary = dictionary;
    this.format = format;

    this.viterbiBuilder = new ViterbiBuilder(
      dictionary.trie,
      dictionary.tokenInfoDictionary,
      dictionary.unknownDictionary
    );

    this.viterbiSearcher = new ViterbiSearcher(dictionary.connectionCosts);
  }

  /**
   * Tokenize input text into morphemes.
   */
  tokenize(text: string): T[] {
    if (text.length === 0) {
      return [];
    }

    // Build lattice
    const lattice = this.viterbiBuilder.build(text);

    // Find optimal path
    const path = this.viterbiSearcher.search(lattice);

    // Convert path nodes to typed tokens
    return path.map((node) => {
      const dict =
        node.type === "UNKNOWN"
          ? this.dictionary.unknownDictionary
          : this.dictionary.tokenInfoDictionary;
      const features = dict.getFeatures(node.wordId);

      return this.format.parseToken(
        {
          wordId: node.wordId,
          type: node.type,
          surface: node.surface,
          offset: node.startPos,
          length: node.length,
          cost: node.shortestCost,
        },
        features
      );
    });
  }

  /**
   * Get the dictionary format handler.
   */
  getFormat(): DictionaryFormat<T> {
    return this.format;
  }
}
