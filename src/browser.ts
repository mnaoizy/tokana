export * from "./index.shared.js";
export { BrowserLoader } from "./loader/BrowserLoader.js";

import type { IpadicToken, UnidicToken, BaseToken } from "./types/token.js";
import type { TokenizerOptions } from "./types/options.js";
import type { Tokenizer } from "./tokenizer/Tokenizer.js";
import { BrowserLoader } from "./loader/BrowserLoader.js";
import { createTokenizerWithLoader } from "./createTokenizer.js";

/**
 * Create a tokenizer with the browser dictionary loader.
 *
 * @example
 * ```typescript
 * const tokenizer = await createTokenizer({
 *   format: "ipadic",
 *   dicPath: "/dict",
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
  return createTokenizerWithLoader(
    options,
    new BrowserLoader(options.dicPath)
  );
}
