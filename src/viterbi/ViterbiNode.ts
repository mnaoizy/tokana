/**
 * Node in the Viterbi lattice.
 */

import type { TokenType } from "../types/token.js";

export class ViterbiNode {
  /** Word ID in the dictionary */
  wordId: number;
  /** Word cost from the dictionary */
  wordCost: number;
  /** Start position in the input string */
  startPos: number;
  /** Length of the surface form */
  length: number;
  /** Left context ID for connection cost lookup */
  leftId: number;
  /** Right context ID for connection cost lookup */
  rightId: number;
  /** Token type */
  type: TokenType;
  /** Surface form */
  surface: string;

  /** Shortest path cost from BOS to this node */
  shortestCost: number;
  /** Previous node in the shortest path */
  prev: ViterbiNode | null;

  constructor(
    wordId: number,
    wordCost: number,
    startPos: number,
    length: number,
    leftId: number,
    rightId: number,
    type: TokenType,
    surface: string
  ) {
    this.wordId = wordId;
    this.wordCost = wordCost;
    this.startPos = startPos;
    this.length = length;
    this.leftId = leftId;
    this.rightId = rightId;
    this.type = type;
    this.surface = surface;
    this.shortestCost = Number.MAX_SAFE_INTEGER;
    this.prev = null;
  }

  static createBOS(): ViterbiNode {
    return new ViterbiNode(
      -1, // wordId
      0, // wordCost
      0, // startPos
      0, // length
      0, // leftId (BOS/EOS left ID)
      0, // rightId (BOS/EOS right ID)
      "BOS",
      ""
    );
  }

  static createEOS(inputLength: number): ViterbiNode {
    return new ViterbiNode(
      -1, // wordId
      0, // wordCost
      inputLength, // startPos
      0, // length
      0, // leftId
      0, // rightId
      "EOS",
      ""
    );
  }
}
