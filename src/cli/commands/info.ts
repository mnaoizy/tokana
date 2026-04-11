/**
 * Dictionary info command.
 * Shows information about a compiled dictionary.
 */

import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { DICT_FILES } from "../../types/dictionary.js";

export async function info(args: string[]): Promise<void> {
  const dictDir = args[0];
  if (!dictDir) {
    console.error("Usage: tokana info <dict-dir>");
    process.exit(1);
  }

  console.log(`Dictionary directory: ${dictDir}\n`);

  for (const [name, fileName] of Object.entries(DICT_FILES)) {
    const filePath = join(dictDir, fileName);
    try {
      const fileStat = await stat(filePath);
      const compressed = await readFile(filePath);
      const decompressed = gunzipSync(compressed);
      console.log(
        `  ${name.padEnd(12)} ${fileName.padEnd(20)} ${formatSize(fileStat.size).padStart(10)} → ${formatSize(decompressed.length).padStart(10)}`
      );
    } catch {
      console.log(`  ${name.padEnd(12)} ${fileName.padEnd(20)} (not found)`);
    }
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
