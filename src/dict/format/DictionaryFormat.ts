/**
 * Dictionary format interface.
 * Abstracts the differences between IPAdic, UniDic, and NEologd.
 */

import type { BaseToken, IpadicToken, UnidicToken } from "../../types/token.js";

export interface DictionaryFormat<T extends BaseToken = BaseToken> {
  /** Format name */
  readonly name: string;

  /**
   * Parse features string into a typed token.
   * Features is a comma-separated string from the dictionary.
   */
  parseToken(
    base: Omit<BaseToken, "cost"> & { cost: number },
    features: string
  ): T;

  /**
   * Get the number of feature fields expected in this format.
   */
  getFeatureCount(): number;
}

export type IpadicFormat = DictionaryFormat<IpadicToken>;
export type UnidicFormat = DictionaryFormat<UnidicToken>;
