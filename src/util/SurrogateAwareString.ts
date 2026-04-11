/**
 * Unicode-aware string that correctly handles surrogate pairs.
 * Provides character-level indexing that treats surrogate pairs as single characters.
 */
export class SurrogateAwareString {
  private readonly codePoints: number[];
  readonly length: number;

  constructor(str: string) {
    this.codePoints = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
        const low = str.charCodeAt(i + 1);
        if (low >= 0xdc00 && low <= 0xdfff) {
          this.codePoints.push(
            (code - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000
          );
          i++;
          continue;
        }
      }
      this.codePoints.push(code);
    }
    this.length = this.codePoints.length;
  }

  charAt(index: number): string {
    if (index < 0 || index >= this.length) return "";
    return String.fromCodePoint(this.codePoints[index]);
  }

  charCodeAt(index: number): number {
    if (index < 0 || index >= this.length) return NaN;
    return this.codePoints[index];
  }

  substring(start: number, end?: number): string {
    const e = end ?? this.length;
    return this.codePoints
      .slice(start, e)
      .map((cp) => String.fromCodePoint(cp))
      .join("");
  }

  slice(start: number, end?: number): string {
    return this.substring(start, end);
  }

  toString(): string {
    return this.codePoints.map((cp) => String.fromCodePoint(cp)).join("");
  }
}
