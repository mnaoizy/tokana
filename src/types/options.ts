/**
 * Tokenizer configuration options.
 */

export type DictionaryFormatType = "ipadic" | "unidic" | "neologd";

export interface TokenizerOptions {
  /** Dictionary format to use */
  format?: DictionaryFormatType;
  /** Path to compiled dictionary directory */
  dicPath: string;
}
