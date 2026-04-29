import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

describe("browser package entry", () => {
  it("builds a browser bundle without Node.js loader code", async () => {
    execFileSync("npm", ["run", "build"], {
      cwd: repoRoot,
      stdio: "pipe",
    });

    const browserBundle = await readFile(
      join(repoRoot, "dist/browser.js"),
      "utf8"
    );

    expect(browserBundle).not.toContain("NodeLoader");
    expect(browserBundle).not.toContain("fs/promises");
    expect(browserBundle).not.toContain("zlib");
    expect(browserBundle).not.toContain("node:path");
    expect(browserBundle).not.toContain("node:util");
  });
});
