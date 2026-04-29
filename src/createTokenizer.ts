import type { DictionaryLoader } from "./loader/DictionaryLoader.js";
import type { TokenizerOptions } from "./types/options.js";
import type { BaseToken } from "./types/token.js";
import type { Tokenizer } from "./tokenizer/Tokenizer.js";
import { TokenizerBuilder } from "./tokenizer/TokenizerBuilder.js";
import { IpadicFormatHandler } from "./dict/format/IpadicFormat.js";
import { UnidicFormatHandler } from "./dict/format/UnidicFormat.js";
import { NeologdFormatHandler } from "./dict/format/NeologdFormat.js";

export function createTokenizerWithLoader(
  options: TokenizerOptions,
  loader: DictionaryLoader
): Promise<Tokenizer<BaseToken>> {
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
