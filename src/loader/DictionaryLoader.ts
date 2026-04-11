/**
 * Dictionary loader interface.
 * Abstracts loading of compiled dictionary files across environments.
 */

export interface DictionaryLoader {
  /**
   * Load a gzipped binary file and return the decompressed data.
   */
  loadArrayBuffer(path: string): Promise<ArrayBuffer>;
}
