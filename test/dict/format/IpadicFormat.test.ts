import { describe, it, expect } from "vitest";
import { IpadicFormatHandler } from "../../../src/dict/format/IpadicFormat.js";

describe("IpadicFormatHandler", () => {
  it("should parse IPAdic features", () => {
    const format = new IpadicFormatHandler();
    const token = format.parseToken(
      {
        wordId: 0,
        type: "KNOWN",
        surface: "東京",
        offset: 0,
        length: 2,
        cost: 100,
      },
      "名詞,固有名詞,地域,一般,*,*,東京,トウキョウ,トーキョー"
    );

    expect(token.surface).toBe("東京");
    expect(token.pos).toBe("名詞");
    expect(token.posDetail1).toBe("固有名詞");
    expect(token.posDetail2).toBe("地域");
    expect(token.posDetail3).toBe("一般");
    expect(token.conjugationType).toBe("*");
    expect(token.conjugationForm).toBe("*");
    expect(token.baseForm).toBe("東京");
    expect(token.reading).toBe("トウキョウ");
    expect(token.pronunciation).toBe("トーキョー");
  });

  it("should handle missing features with defaults", () => {
    const format = new IpadicFormatHandler();
    const token = format.parseToken(
      {
        wordId: 0,
        type: "UNKNOWN",
        surface: "テスト",
        offset: 0,
        length: 3,
        cost: 0,
      },
      "名詞"
    );

    expect(token.pos).toBe("名詞");
    expect(token.posDetail1).toBe("*");
    expect(token.reading).toBe("*");
  });

  it("should report feature count", () => {
    const format = new IpadicFormatHandler();
    expect(format.getFeatureCount()).toBe(9);
  });
});
