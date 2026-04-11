/**
 * UniDic dictionary format parser.
 */

import type { BaseToken, UnidicToken } from "../../types/token.js";
import type { DictionaryFormat } from "./DictionaryFormat.js";

export class UnidicFormatHandler implements DictionaryFormat<UnidicToken> {
  readonly name = "unidic";

  parseToken(
    base: Omit<BaseToken, "cost"> & { cost: number },
    features: string
  ): UnidicToken {
    const parts = features.split(",");
    return {
      ...base,
      pos1: parts[0] ?? "*",
      pos2: parts[1] ?? "*",
      pos3: parts[2] ?? "*",
      pos4: parts[3] ?? "*",
      cType: parts[4] ?? "*",
      cForm: parts[5] ?? "*",
      lForm: parts[6] ?? "*",
      lemma: parts[7] ?? "*",
      orth: parts[8] ?? "*",
      orthBase: parts[9] ?? "*",
      pron: parts[10] ?? "*",
      pronBase: parts[11] ?? "*",
      goshu: parts[12] ?? "*",
      iType: parts[13] ?? "*",
      iForm: parts[14] ?? "*",
      fType: parts[15] ?? "*",
      fForm: parts[16] ?? "*",
    };
  }

  getFeatureCount(): number {
    return 17;
  }
}
