/**
 * Container that holds all dictionary components needed for tokenization.
 */

import { DoubleArray } from "../trie/DoubleArray.js";
import { ConnectionCosts } from "./ConnectionCosts.js";
import { TokenInfoDictionary } from "./TokenInfoDictionary.js";
import { UnknownDictionary } from "./UnknownDictionary.js";

export class DictionaryContainer {
  readonly trie: DoubleArray;
  readonly tokenInfoDictionary: TokenInfoDictionary;
  readonly connectionCosts: ConnectionCosts;
  readonly unknownDictionary: UnknownDictionary;

  constructor(
    trie: DoubleArray,
    tokenInfoDictionary: TokenInfoDictionary,
    connectionCosts: ConnectionCosts,
    unknownDictionary: UnknownDictionary
  ) {
    this.trie = trie;
    this.tokenInfoDictionary = tokenInfoDictionary;
    this.connectionCosts = connectionCosts;
    this.unknownDictionary = unknownDictionary;
  }
}
