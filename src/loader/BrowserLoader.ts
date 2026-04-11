/**
 * Dictionary loader for browser using fetch and DecompressionStream.
 */

import type { DictionaryLoader } from "./DictionaryLoader.js";

export class BrowserLoader implements DictionaryLoader {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    // Ensure trailing slash
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  }

  async loadArrayBuffer(fileName: string): Promise<ArrayBuffer> {
    const url = this.baseUrl + fileName;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch dictionary file: ${url} (${response.status})`);
    }

    // If the server set Content-Encoding: gzip, the browser already decompressed
    // the response transparently — no need to decompress again.
    const contentEncoding = response.headers.get("Content-Encoding");
    if (contentEncoding === "gzip") {
      return response.arrayBuffer();
    }

    if (!response.body) {
      throw new Error(`Response body is null for: ${url}`);
    }

    // Use native DecompressionStream for gzip decompression
    const ds = new DecompressionStream("gzip");
    const decompressedStream = response.body.pipeThrough(ds);
    const reader = decompressedStream.getReader();

    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalLength += value.byteLength;
    }

    // Concatenate chunks
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return result.buffer;
  }
}
