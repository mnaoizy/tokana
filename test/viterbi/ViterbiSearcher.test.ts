import { describe, it, expect } from "vitest";
import { ViterbiNode } from "../../src/viterbi/ViterbiNode.js";
import { ViterbiLattice } from "../../src/viterbi/ViterbiLattice.js";
import { ViterbiSearcher } from "../../src/viterbi/ViterbiSearcher.js";
import { ConnectionCosts } from "../../src/dict/ConnectionCosts.js";

describe("ViterbiSearcher", () => {
  it("should find optimal path in simple lattice", () => {
    // Create a simple connection cost matrix
    const cc = new ConnectionCosts(3, 3);
    // All connections cost 0 for simplicity
    cc.put(0, 0, 0);
    cc.put(0, 1, 0);
    cc.put(0, 2, 0);
    cc.put(1, 0, 0);
    cc.put(1, 1, 0);
    cc.put(1, 2, 0);
    cc.put(2, 0, 0);
    cc.put(2, 1, 0);
    cc.put(2, 2, 0);

    const text = "ABC";
    const lattice = new ViterbiLattice(text.length);

    // Path 1: A(cost=10) + BC(cost=5) = 15
    const nodeA = new ViterbiNode(0, 10, 0, 1, 0, 0, "KNOWN", "A");
    const nodeBC = new ViterbiNode(1, 5, 1, 2, 0, 0, "KNOWN", "BC");

    // Path 2: AB(cost=3) + C(cost=3) = 6 (cheaper)
    const nodeAB = new ViterbiNode(2, 3, 0, 2, 0, 0, "KNOWN", "AB");
    const nodeC = new ViterbiNode(3, 3, 2, 1, 0, 0, "KNOWN", "C");

    lattice.addNode(nodeA);
    lattice.addNode(nodeAB);
    lattice.addNode(nodeBC);
    lattice.addNode(nodeC);

    const searcher = new ViterbiSearcher(cc);
    const path = searcher.search(lattice);

    // Should choose path 2 (AB + C = 6) over path 1 (A + BC = 15)
    expect(path).toHaveLength(2);
    expect(path[0].surface).toBe("AB");
    expect(path[1].surface).toBe("C");
  });

  it("should handle single-character path", () => {
    const cc = new ConnectionCosts(2, 2);
    cc.put(0, 0, 0);
    cc.put(0, 1, 0);
    cc.put(1, 0, 0);
    cc.put(1, 1, 0);

    const lattice = new ViterbiLattice(1);
    const node = new ViterbiNode(0, 5, 0, 1, 0, 0, "KNOWN", "X");
    lattice.addNode(node);

    const searcher = new ViterbiSearcher(cc);
    const path = searcher.search(lattice);

    expect(path).toHaveLength(1);
    expect(path[0].surface).toBe("X");
  });

  it("should consider connection costs", () => {
    const cc = new ConnectionCosts(3, 3);
    cc.put(0, 0, 0);
    cc.put(0, 1, 100); // expensive connection from BOS to node with leftId=1
    cc.put(0, 2, 0);
    cc.put(1, 0, 0);
    cc.put(2, 0, 0);

    const lattice = new ViterbiLattice(1);

    // Node 1: low word cost but high connection cost
    const node1 = new ViterbiNode(0, 1, 0, 1, 1, 1, "KNOWN", "X");
    // Node 2: higher word cost but low connection cost
    const node2 = new ViterbiNode(1, 10, 0, 1, 2, 2, "KNOWN", "X");

    lattice.addNode(node1);
    lattice.addNode(node2);

    const searcher = new ViterbiSearcher(cc);
    const path = searcher.search(lattice);

    // node1 total: 0 + 100 + 1 = 101
    // node2 total: 0 + 0 + 10 = 10
    expect(path).toHaveLength(1);
    expect(path[0].wordId).toBe(1); // node2 is cheaper overall
  });
});
