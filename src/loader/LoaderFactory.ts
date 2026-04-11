/**
 * Factory for creating the appropriate dictionary loader based on the runtime environment.
 */

import type { DictionaryLoader } from "./DictionaryLoader.js";

export async function createLoaderAsync(dicPath: string): Promise<DictionaryLoader> {
  if (isNodeEnvironment()) {
    const { NodeLoader } = await import("./NodeLoader.js");
    return new NodeLoader(dicPath);
  } else {
    const { BrowserLoader } = await import("./BrowserLoader.js");
    return new BrowserLoader(dicPath);
  }
}

function isNodeEnvironment(): boolean {
  return (
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null
  );
}
