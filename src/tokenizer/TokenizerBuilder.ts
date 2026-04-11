/**
 * Asynchronous tokenizer builder.
 * Loads dictionary files and constructs a ready-to-use Tokenizer.
 */

import type { BaseToken } from "../types/token.js";
import type { TokenizerOptions } from "../types/options.js";
import type { DictionaryLoader } from "../loader/DictionaryLoader.js";
import type { DictionaryFormat } from "../dict/format/DictionaryFormat.js";
import { DICT_FILES } from "../types/dictionary.js";
import { DoubleArray } from "../trie/DoubleArray.js";
import { ConnectionCosts } from "../dict/ConnectionCosts.js";
import { TokenInfoDictionary } from "../dict/TokenInfoDictionary.js";
import { UnknownDictionary } from "../dict/UnknownDictionary.js";
import { CharacterDefinition } from "../dict/CharacterDefinition.js";
import { DictionaryContainer } from "../dict/DictionaryContainer.js";
import { Tokenizer } from "./Tokenizer.js";

export class TokenizerBuilder {
  /**
   * Build a tokenizer with the given options.
   */
  static async build<T extends BaseToken>(
    _options: TokenizerOptions,
    loader: DictionaryLoader,
    format: DictionaryFormat<T>
  ): Promise<Tokenizer<T>> {
    // Load all dictionary files in parallel
    const [
      trieData,
      tidData,
      tidPosData,
      tidMapData,
      ccData,
      unkData,
      unkPosData,
      unkMapData,
      unkCharData,
      unkCompatData,
      unkInvokeData,
    ] = await Promise.all([
      loader.loadArrayBuffer(DICT_FILES.trie),
      loader.loadArrayBuffer(DICT_FILES.tid),
      loader.loadArrayBuffer(DICT_FILES.tidPos),
      loader.loadArrayBuffer(DICT_FILES.tidMap),
      loader.loadArrayBuffer(DICT_FILES.cc),
      loader.loadArrayBuffer(DICT_FILES.unk),
      loader.loadArrayBuffer(DICT_FILES.unkPos),
      loader.loadArrayBuffer(DICT_FILES.unkMap),
      loader.loadArrayBuffer(DICT_FILES.unkChar),
      loader.loadArrayBuffer(DICT_FILES.unkCompat),
      loader.loadArrayBuffer(DICT_FILES.unkInvoke),
    ]);

    // Build trie
    const baseArray = new Int32Array(trieData);
    // The trie data contains base and check arrays concatenated
    // First half is base, second half is check
    const halfLen = baseArray.length / 2;
    const base = baseArray.slice(0, halfLen);
    const check = baseArray.slice(halfLen);
    const trie = DoubleArray.fromArrays(base, check);

    // Build connection costs
    const ccArray = new Int16Array(ccData);
    const connectionCosts = ConnectionCosts.fromBuffer(ccArray);

    // Build token info dictionary
    const tokenInfoDictionary = new TokenInfoDictionary();
    tokenInfoDictionary.loadDictionary(new Uint8Array(tidData));
    tokenInfoDictionary.loadPosVector(new Uint8Array(tidPosData));
    tokenInfoDictionary.loadTargetMap(new Uint8Array(tidMapData));

    // Build character definition
    const charDef = CharacterDefinition.fromBuffers(
      new Uint8Array(unkCharData),
      new Uint32Array(unkCompatData),
      new Uint8Array(unkInvokeData)
    );

    // Build unknown dictionary
    const unknownDictionary = new UnknownDictionary();
    unknownDictionary.loadDictionary(new Uint8Array(unkData));
    unknownDictionary.loadPosVector(new Uint8Array(unkPosData));
    unknownDictionary.loadTargetMap(new Uint8Array(unkMapData));
    unknownDictionary.loadCharacterDefinition(charDef);

    // Create container
    const container = new DictionaryContainer(
      trie,
      tokenInfoDictionary,
      connectionCosts,
      unknownDictionary
    );

    return new Tokenizer<T>(container, format);
  }
}
