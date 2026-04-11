/**
 * NEologd dictionary format parser.
 * NEologd is based on IPAdic format with the same feature structure.
 */

import type { IpadicToken } from "../../types/token.js";
import { IpadicFormatHandler } from "./IpadicFormat.js";

export class NeologdFormatHandler extends IpadicFormatHandler {
  override readonly name: string = "neologd";
}

export type NeologdToken = IpadicToken;
