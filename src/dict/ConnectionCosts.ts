/**
 * Connection cost matrix.
 * Stores the cost of transitioning from one morpheme to the next.
 * Matrix is indexed by [right_id][left_id].
 */
export class ConnectionCosts {
  private readonly forwardSize: number;
  private readonly backwardSize: number;
  private readonly costs: Int16Array;

  constructor(forwardSize: number, backwardSize: number) {
    this.forwardSize = forwardSize;
    this.backwardSize = backwardSize;
    this.costs = new Int16Array(forwardSize * backwardSize);
  }

  put(forwardId: number, backwardId: number, cost: number): void {
    this.costs[forwardId * this.backwardSize + backwardId] = cost;
  }

  get(forwardId: number, backwardId: number): number {
    return this.costs[forwardId * this.backwardSize + backwardId];
  }

  getForwardSize(): number {
    return this.forwardSize;
  }

  getBackwardSize(): number {
    return this.backwardSize;
  }

  /**
   * Load from a raw Int16Array buffer.
   * Format: [forwardSize (as int16), backwardSize (as int16), ...costs]
   */
  static fromBuffer(buffer: Int16Array): ConnectionCosts {
    const forwardSize = buffer[0];
    const backwardSize = buffer[1];
    const cc = new ConnectionCosts(forwardSize, backwardSize);
    cc.costs.set(buffer.subarray(2, 2 + forwardSize * backwardSize));
    return cc;
  }

  /**
   * Serialize to Int16Array buffer.
   */
  toBuffer(): Int16Array {
    const buffer = new Int16Array(2 + this.forwardSize * this.backwardSize);
    buffer[0] = this.forwardSize;
    buffer[1] = this.backwardSize;
    buffer.set(this.costs, 2);
    return buffer;
  }
}
