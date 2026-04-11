/**
 * Viterbi algorithm searcher.
 * Finds the optimal path through the lattice using dynamic programming.
 */

import type { ConnectionCosts } from "../dict/ConnectionCosts.js";
import type { ViterbiLattice } from "./ViterbiLattice.js";
import { ViterbiNode } from "./ViterbiNode.js";

export class ViterbiSearcher {
  private readonly connectionCosts: ConnectionCosts;

  constructor(connectionCosts: ConnectionCosts) {
    this.connectionCosts = connectionCosts;
  }

  /**
   * Find the optimal (lowest cost) path through the lattice.
   * Returns the path as an array of ViterbiNodes from first token to last (excluding BOS/EOS).
   */
  search(lattice: ViterbiLattice): ViterbiNode[] {
    // Forward pass: compute shortest cost to each node
    this.forward(lattice);

    // Backward pass: trace back from EOS to BOS
    return this.backward(lattice);
  }

  /**
   * Forward pass: for each position, find the shortest path cost to each node.
   */
  private forward(lattice: ViterbiLattice): void {
    const inputLength = lattice.getInputLength();

    for (let endPos = 1; endPos <= inputLength; endPos++) {
      const nodes = lattice.getNodesEndAt(endPos);

      for (const node of nodes) {
        // Find the best previous node
        const prevNodes = lattice.getNodesEndAt(node.startPos);

        for (const prevNode of prevNodes) {
          if (prevNode.shortestCost === Number.MAX_SAFE_INTEGER) continue;

          const connectionCost = this.connectionCosts.get(
            prevNode.rightId,
            node.leftId
          );
          const totalCost =
            prevNode.shortestCost + connectionCost + node.wordCost;

          if (totalCost < node.shortestCost) {
            node.shortestCost = totalCost;
            node.prev = prevNode;
          }
        }
      }
    }

    // Connect EOS
    const eos = lattice.eos;
    const lastNodes = lattice.getNodesEndAt(inputLength);
    for (const node of lastNodes) {
      if (node.shortestCost === Number.MAX_SAFE_INTEGER) continue;

      const connectionCost = this.connectionCosts.get(node.rightId, eos.leftId);
      const totalCost = node.shortestCost + connectionCost + eos.wordCost;

      if (totalCost < eos.shortestCost) {
        eos.shortestCost = totalCost;
        eos.prev = node;
      }
    }
  }

  /**
   * Backward pass: trace back from EOS to BOS to get the optimal path.
   */
  private backward(lattice: ViterbiLattice): ViterbiNode[] {
    const path: ViterbiNode[] = [];
    let node: ViterbiNode | null = lattice.eos.prev;

    while (node !== null && node.type !== "BOS") {
      path.unshift(node);
      node = node.prev;
    }

    return path;
  }
}
