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
export { NodeLoader } from "./loader/NodeLoader.js";
export { BrowserLoader } from "./loader/BrowserLoader.js";

// Utilities
export { ByteBuffer } from "./util/ByteBuffer.js";
export { SurrogateAwareString } from "./util/SurrogateAwareString.js";

// Convenience factory
import type { IpadicToken, UnidicToken, BaseToken } from "./types/token.js";
import type { TokenizerOptions } from "./types/options.js";
import type { Tokenizer } from "./tokenizer/Tokenizer.js";
import { TokenizerBuilder } from "./tokenizer/TokenizerBuilder.js";
import { IpadicFormatHandler } from "./dict/format/IpadicFormat.js";
import { UnidicFormatHandler } from "./dict/format/UnidicFormat.js";
import { NeologdFormatHandler } from "./dict/format/NeologdFormat.js";

/**
 * Create a tokenizer with the given options.
 *
 * @example
 * ```typescript
 * const tokenizer = await createTokenizer({
 *   format: "ipadic",
 *   dicPath: "./dict",
 * });
 * const tokens = tokenizer.tokenize("東京都に住んでいる");
 * ```
 */
export async function createTokenizer(
  options: TokenizerOptions & { format: "ipadic" }
): Promise<Tokenizer<IpadicToken>>;
export async function createTokenizer(
  options: TokenizerOptions & { format: "unidic" }
): Promise<Tokenizer<UnidicToken>>;
export async function createTokenizer(
  options: TokenizerOptions & { format: "neologd" }
): Promise<Tokenizer<IpadicToken>>;
export async function createTokenizer(
  options: TokenizerOptions
): Promise<Tokenizer<BaseToken>>;
export async function createTokenizer(
  options: TokenizerOptions
): Promise<Tokenizer<BaseToken>> {
  const { createLoaderAsync } = await import("./loader/LoaderFactory.js");
  const loader = await createLoaderAsync(options.dicPath);

  const format = options.format ?? "ipadic";
  switch (format) {
    case "ipadic":
      return TokenizerBuilder.build(options, loader, new IpadicFormatHandler());
    case "unidic":
      return TokenizerBuilder.build(options, loader, new UnidicFormatHandler());
    case "neologd":
      return TokenizerBuilder.build(options, loader, new NeologdFormatHandler());
    default:
      throw new Error(`Unknown dictionary format: ${format}`);
  }
}
