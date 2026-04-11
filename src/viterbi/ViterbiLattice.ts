/**
 * Viterbi lattice structure.
 * Organizes nodes by their starting position in the input string.
 */

import { ViterbiNode } from "./ViterbiNode.js";

export class ViterbiLattice {
  /** Nodes indexed by end position (position after the last character) */
  private nodesEndAt: ViterbiNode[][];
  /** Length of the input string */
  private readonly inputLength: number;

  /** BOS node */
  readonly bos: ViterbiNode;
  /** EOS node */
  readonly eos: ViterbiNode;

  constructor(inputLength: number) {
    this.inputLength = inputLength;
    // nodesEndAt[i] = nodes whose surface ends at position i
    // Index 0 is for BOS, index inputLength+1 is for EOS
    this.nodesEndAt = new Array(inputLength + 2);
    for (let i = 0; i < this.nodesEndAt.length; i++) {
      this.nodesEndAt[i] = [];
    }

    this.bos = ViterbiNode.createBOS();
    this.bos.shortestCost = 0;
    this.nodesEndAt[0].push(this.bos);

    this.eos = ViterbiNode.createEOS(inputLength);
  }

  /**
   * Add a node to the lattice.
   * Node is indexed by its end position (startPos + length).
   */
  addNode(node: ViterbiNode): void {
    const endPos = node.startPos + node.length;
    if (endPos >= 0 && endPos < this.nodesEndAt.length) {
      this.nodesEndAt[endPos].push(node);
    }
  }

  /**
   * Get all nodes that end at the given position.
   */
  getNodesEndAt(pos: number): ViterbiNode[] {
    return this.nodesEndAt[pos] ?? [];
  }

  getInputLength(): number {
    return this.inputLength;
  }
}
