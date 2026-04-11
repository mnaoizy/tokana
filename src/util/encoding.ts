/**
 * Encoding utilities for dictionary compilation.
 * Handles EUC-JP to UTF-8 conversion for MeCab dictionary sources.
 */

/**
 * Decode EUC-JP encoded bytes to a UTF-8 string.
 * Uses the TextDecoder API available in both Node.js and browsers.
 */
export function decodeEucJp(data: Uint8Array): string {
  const decoder = new TextDecoder("euc-jp");
  return decoder.decode(data);
}

/**
 * Detect if data is likely EUC-JP encoded.
 */
export function isEucJp(data: Uint8Array): boolean {
  // Check for EUC-JP high-byte patterns
  for (let i = 0; i < Math.min(data.length, 1000); i++) {
    const b = data[i];
    if (b >= 0xa1 && b <= 0xfe) {
      // Likely EUC-JP double-byte character
      if (i + 1 < data.length) {
        const b2 = data[i + 1];
        if (b2 >= 0xa1 && b2 <= 0xfe) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Decode data with automatic encoding detection (UTF-8 or EUC-JP).
 */
export function decodeAutoDetect(data: Uint8Array): string {
  // Try UTF-8 first
  try {
    const utf8 = new TextDecoder("utf-8", { fatal: true });
    return utf8.decode(data);
  } catch {
    // Fall back to EUC-JP
    return decodeEucJp(data);
  }
}
