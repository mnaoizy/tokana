/**
 * tokana - Modern Japanese Morphological Analyzer
 */

export { Tokenizer } from "./tokenizer/Tokenizer.js";
export { TokenizerBuilder } from "./tokenizer/TokenizerBuilder.js";

// Types
export type {
  BaseToken,
  IpadicToken,
  UnidicToken,
  Token,
  TokenType,
} from "./types/token.js";
export type { TokenizerOptions, DictionaryFormatType } from "./types/options.js";

// Dictionary formats
export { IpadicFormatHandler } from "./dict/format/IpadicFormat.js";
export { UnidicFormatHandler } from "./dict/format/UnidicFormat.js";
export { NeologdFormatHandler } from "./dict/format/NeologdFormat.js";
export type { DictionaryFormat } from "./dict/format/DictionaryFormat.js";

// Dictionary components (for advanced use)
export { DoubleArray } from "./trie/DoubleArray.js";
export { DoubleArrayBuilder } from "./trie/DoubleArrayBuilder.js";
export { ConnectionCosts } from "./dict/ConnectionCosts.js";
export { TokenInfoDictionary } from "./dict/TokenInfoDictionary.js";
export { UnknownDictionary } from "./dict/UnknownDictionary.js";
export { CharacterDefinition } from "./dict/CharacterDefinition.js";
export { DictionaryContainer } from "./dict/DictionaryContainer.js";

// Loaders
export type { DictionaryLoader } from "./loader/DictionaryLoader.js";

// Utilities
export { ByteBuffer } from "./util/ByteBuffer.js";
export { SurrogateAwareString } from "./util/SurrogateAwareString.js";
