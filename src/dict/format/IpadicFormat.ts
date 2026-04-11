/**
 * IPAdic dictionary format parser.
 * Parses features in the IPAdic format (MeCab-IPADIC).
 */

import type { BaseToken, IpadicToken } from "../../types/token.js";
import type { DictionaryFormat } from "./DictionaryFormat.js";

export class IpadicFormatHandler implements DictionaryFormat<IpadicToken> {
  readonly name: string = "ipadic";

  parseToken(
    base: Omit<BaseToken, "cost"> & { cost: number },
    features: string
  ): IpadicToken {
    const parts = features.split(",");
    return {
      ...base,
      pos: parts[0] ?? "*",
      posDetail1: parts[1] ?? "*",
      posDetail2: parts[2] ?? "*",
      posDetail3: parts[3] ?? "*",
      conjugationType: parts[4] ?? "*",
      conjugationForm: parts[5] ?? "*",
      baseForm: parts[6] ?? "*",
      reading: parts[7] ?? "*",
      pronunciation: parts[8] ?? "*",
    };
  }

  getFeatureCount(): number {
    return 9;
  }
}
