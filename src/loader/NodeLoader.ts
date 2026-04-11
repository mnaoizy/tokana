/**
 * Dictionary loader for Node.js using native fs and zlib.
 */

import type { DictionaryLoader } from "./DictionaryLoader.js";

export class NodeLoader implements DictionaryLoader {
  private readonly basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async loadArrayBuffer(fileName: string): Promise<ArrayBuffer> {
    const path = await import("node:path");
    const fs = await import("node:fs/promises");
    const zlib = await import("node:zlib");
    const { promisify } = await import("node:util");

    const gunzip = promisify(zlib.gunzip);
    const filePath = path.join(this.basePath, fileName);
    const compressed = await fs.readFile(filePath);
    const decompressed = await gunzip(compressed);
    return decompressed.buffer.slice(
      decompressed.byteOffset,
      decompressed.byteOffset + decompressed.byteLength
    );
  }
}
