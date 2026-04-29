import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { compile } from "../../src/cli/commands/compile.js";
import { createTokenizer } from "../../src/index.js";

const crlf = (lines: string[]) => lines.join("\r\n") + "\r\n";

describe("compile", () => {
  it("preserves same-surface candidates and unknown character classes", async () => {
    const root = await mkdtemp(join(tmpdir(), "tokana-compile-"));
    const sourceDir = join(root, "src");
    const outputDir = join(root, "dict");

    try {
      await mkdir(sourceDir, { recursive: true });

      await writeFile(
        join(sourceDir, "matrix.def"),
        "1 1\n0 0 0\n"
      );
      await writeFile(
        join(sourceDir, "char.def"),
        [
          "DEFAULT 0 1 0",
          "ALPHA 1 1 0",
          "NUMERIC 1 1 0",
          "0x0041..0x005A ALPHA",
          "0x0030..0x0039 NUMERIC",
          "",
        ].join("\n")
      );
      await writeFile(
        join(sourceDir, "unk.def"),
        [
          "ALPHA,0,0,1,名詞,固有名詞,*,*,*,*,*,*,*",
          "NUMERIC,0,0,100,記号,一般,*,*,*,*,*,*,*",
          "",
        ].join("\n")
      );
      await writeFile(
        join(sourceDir, "sample.csv"),
        [
          "x,0,0,100,名詞,一般,*,*,*,*,x,エックス,エックス",
          "x,0,0,1,動詞,自立,*,*,*,*,x,エックス,エックス",
          "",
        ].join("\n")
      );

      await compile([sourceDir, outputDir]);

      const tokenizer = await createTokenizer({
        format: "ipadic",
        dicPath: outputDir,
      });

      expect(tokenizer.tokenize("x")[0]).toMatchObject({
        wordId: 1,
        pos: "動詞",
      });
      expect(tokenizer.tokenize("A")[0]).toMatchObject({
        type: "UNKNOWN",
        pos: "名詞",
      });
      expect(tokenizer.tokenize("1")[0]).toMatchObject({
        type: "UNKNOWN",
        pos: "記号",
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("does not leak CRLF line endings into token features", async () => {
    const root = await mkdtemp(join(tmpdir(), "tokana-compile-crlf-"));
    const sourceDir = join(root, "src");
    const outputDir = join(root, "dict");

    try {
      await mkdir(sourceDir, { recursive: true });

      await writeFile(join(sourceDir, "matrix.def"), crlf(["1 1", "0 0 0"]));
      await writeFile(
        join(sourceDir, "char.def"),
        crlf([
          "DEFAULT 0 1 0",
          "ALPHA 1 1 0",
          "0x0041..0x005A ALPHA",
        ])
      );
      await writeFile(
        join(sourceDir, "unk.def"),
        crlf(["ALPHA,0,0,1,名詞,固有名詞,*,*,*,*,A,エー,エー"])
      );
      await writeFile(
        join(sourceDir, "sample.csv"),
        crlf(["x,0,0,1,名詞,一般,*,*,*,*,x,エックス,エックス"])
      );

      await compile([sourceDir, outputDir]);

      const tokenizer = await createTokenizer({
        format: "ipadic",
        dicPath: outputDir,
      });

      expect(tokenizer.tokenize("x")[0]).toMatchObject({
        type: "KNOWN",
        pronunciation: "エックス",
      });
      expect(tokenizer.tokenize("A")[0]).toMatchObject({
        type: "UNKNOWN",
        pronunciation: "エー",
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
