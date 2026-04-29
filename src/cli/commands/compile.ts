/**
 * Dictionary compilation command.
 * Compiles MeCab source files (CSV, matrix.def, char.def, unk.def) into binary .dat.gz files.
 */

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { DoubleArrayBuilder } from "../../trie/DoubleArrayBuilder.js";
import { ByteBuffer } from "../../util/ByteBuffer.js";
import { ConnectionCosts } from "../../dict/ConnectionCosts.js";
import { CharacterDefinition } from "../../dict/CharacterDefinition.js";
import { decodeAutoDetect } from "../../util/encoding.js";

export async function compile(args: string[]): Promise<void> {
  const sourceDir = args[0];
  const outputDir = args[1];
  // const formatFlag = args.indexOf("--format");
  // const format = formatFlag >= 0 ? args[formatFlag + 1] : "ipadic";

  if (!sourceDir || !outputDir) {
    console.error("Usage: tokana build <source-dir> <output-dir> [--format ipadic|unidic|neologd]");
    process.exit(1);
  }

  console.log(`Compiling dictionary from ${sourceDir} to ${outputDir}`);

  await mkdir(outputDir, { recursive: true });

  // Step 1: Parse matrix.def → connection costs
  console.log("  Parsing matrix.def...");
  const ccBuffer = await parseMatrixDef(join(sourceDir, "matrix.def"));
  await writeGzipped(join(outputDir, "cc.dat.gz"), ccBuffer);

  // Step 2: Parse char.def → character definitions
  console.log("  Parsing char.def...");
  const { categoryMap, compatMap, invokeBuf, charDef } = await parseCharDef(
    join(sourceDir, "char.def")
  );
  await writeGzipped(join(outputDir, "unk_char.dat.gz"), categoryMap);
  await writeGzipped(
    join(outputDir, "unk_compat.dat.gz"),
    new Uint8Array(compatMap.buffer)
  );
  await writeGzipped(join(outputDir, "unk_invoke.dat.gz"), invokeBuf);

  // Step 3: Parse CSV dictionary files → trie + token info
  console.log("  Parsing CSV dictionary files...");
  const csvFiles = (await readdir(sourceDir)).filter((f) => f.endsWith(".csv"));

  interface DictEntry {
    surface: string;
    leftId: number;
    rightId: number;
    cost: number;
    features: string;
  }

  const entries: DictEntry[] = [];
  for (const csvFile of csvFiles) {
    const raw = await readFile(join(sourceDir, csvFile));
    const text = decodeAutoDetect(new Uint8Array(raw));
    for (const line of splitLines(text)) {
      if (line.trim() === "") continue;
      // MeCab CSV format: surface,leftId,rightId,cost,features...
      const parts = parseCsvLine(line);
      if (parts.length < 5) continue;
      entries.push({
        surface: parts[0],
        leftId: parseInt(parts[1], 10),
        rightId: parseInt(parts[2], 10),
        cost: parseInt(parts[3], 10),
        features: parts.slice(4).join(","),
      });
    }
  }

  // Sort entries by surface for trie construction
  entries.sort((a, b) => (a.surface < b.surface ? -1 : a.surface > b.surface ? 1 : 0));

  // Build trie and token info dictionary
  console.log(`  Building trie from ${entries.length} entries...`);

  // Group entries by surface to handle duplicates
  const surfaceGroups = new Map<string, DictEntry[]>();
  for (const entry of entries) {
    const group = surfaceGroups.get(entry.surface);
    if (group) {
      group.push(entry);
    } else {
      surfaceGroups.set(entry.surface, [entry]);
    }
  }

  // Build token info dictionary buffer
  const tidBuffer = new ByteBuffer(entries.length * 64);
  const tidMapEntries: number[] = []; // wordId → position in tidBuffer
  const tidWordIdGroups: { firstWordId: number; count: number }[] = [];
  let wordId = 0;

  const trieKeys: { key: number[]; value: number }[] = [];

  for (const [surface, group] of surfaceGroups) {
    const firstWordId = wordId;
    for (const entry of group) {
      const pos = tidBuffer.getPosition();
      tidMapEntries.push(pos);

      tidBuffer.putInt16(entry.leftId);
      tidBuffer.putInt16(entry.rightId);
      tidBuffer.putInt16(entry.cost);
      tidBuffer.putInt16(entry.features.length);
      tidBuffer.putString(entry.features);

      wordId++;
    }
    tidWordIdGroups.push({ firstWordId, count: group.length });

    // Trie maps surface → first word ID for this surface
    trieKeys.push({
      key: Array.from(surface).map((ch) => ch.codePointAt(0) ?? 0),
      value: firstWordId,
    });
  }

  // Sort trie keys lexicographically
  trieKeys.sort((a, b) => {
    const len = Math.min(a.key.length, b.key.length);
    for (let i = 0; i < len; i++) {
      if (a.key[i] !== b.key[i]) return a.key[i] - b.key[i];
    }
    return a.key.length - b.key.length;
  });

  const { base, check } = DoubleArrayBuilder.build(trieKeys);

  // Save trie (base + check concatenated)
  const trieBuffer = new Int32Array(base.length + check.length);
  trieBuffer.set(base, 0);
  trieBuffer.set(check, base.length);
  await writeGzipped(
    join(outputDir, "base.dat.gz"),
    new Uint8Array(trieBuffer.buffer)
  );

  // Save token info dictionary
  await writeGzipped(join(outputDir, "tid.dat.gz"), tidBuffer.shrink());

  await writeGzipped(
    join(outputDir, "tid_pos.dat.gz"),
    buildWordIdGroupBuffer(tidWordIdGroups)
  );

  // Save target map
  const mapBuf = new ByteBuffer(4 + tidMapEntries.length * 4);
  mapBuf.putInt32(tidMapEntries.length);
  for (const pos of tidMapEntries) {
    mapBuf.putInt32(pos);
  }
  await writeGzipped(join(outputDir, "tid_map.dat.gz"), mapBuf.shrink());

  // Step 4: Parse unk.def → unknown word dictionary
  console.log("  Parsing unk.def...");
  const { unkBuf, unkPosBuf, unkMapBuf } = await parseUnkDef(
    join(sourceDir, "unk.def"),
    charDef
  );
  await writeGzipped(join(outputDir, "unk.dat.gz"), unkBuf);
  await writeGzipped(join(outputDir, "unk_pos.dat.gz"), unkPosBuf);
  await writeGzipped(join(outputDir, "unk_map.dat.gz"), unkMapBuf);

  console.log("  Done!");
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function splitLines(text: string): string[] {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
}

async function parseMatrixDef(path: string): Promise<Uint8Array> {
  const raw = await readFile(path);
  const text = decodeAutoDetect(new Uint8Array(raw));
  const lines = splitLines(text.trim());

  // First line: forward_size backward_size
  const [forwardStr, backwardStr] = lines[0].split(/\s+/);
  const forwardSize = parseInt(forwardStr, 10);
  const backwardSize = parseInt(backwardStr, 10);

  const cc = new ConnectionCosts(forwardSize, backwardSize);

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length < 3) continue;
    const fwd = parseInt(parts[0], 10);
    const bwd = parseInt(parts[1], 10);
    const cost = parseInt(parts[2], 10);
    cc.put(fwd, bwd, cost);
  }

  const buf = cc.toBuffer();
  return new Uint8Array(buf.buffer);
}

async function parseCharDef(
  path: string
): Promise<{
  categoryMap: Uint8Array;
  compatMap: Uint32Array;
  invokeBuf: Uint8Array;
  charDef: CharacterDefinition;
}> {
  const raw = await readFile(path);
  const text = decodeAutoDetect(new Uint8Array(raw));
  const lines = splitLines(text.trim());

  const charDef = new CharacterDefinition();

  // First pass: register character classes
  const classNames = new Map<string, number>();
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    // Character class definition: CLASSNAME invoke group length
    const match = trimmed.match(
      /^([A-Z_]+)\s+(0|1)\s+(0|1)\s+(\d+)/
    );
    if (match && !trimmed.startsWith("0x")) {
      const name = match[1];
      if (!classNames.has(name)) {
        const id = charDef.addCharacterClass({
          name,
          invoke: match[2] === "1",
          group: match[3] === "1",
          length: parseInt(match[4], 10),
        });
        classNames.set(name, id);
      }
    }
  }

  // Second pass: character range mappings
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    // Range mapping: 0xHHHH [..0xHHHH] CLASSNAME [COMPAT_CLASSES...]
    const match = trimmed.match(
      /^(0x[0-9A-Fa-f]+)(?:\.\.(0x[0-9A-Fa-f]+))?\s+(\S+)(?:\s+(.*))?$/
    );
    if (match) {
      const start = parseInt(match[1], 16);
      const end = match[2] ? parseInt(match[2], 16) : start;
      const className = match[3];
      const classId = classNames.get(className);
      if (classId === undefined) continue;

      const compatStr = match[4]?.trim() ?? "";
      const compatClasses = compatStr
        ? compatStr
            .split(/\s+/)
            .map((name) => classNames.get(name))
            .filter((id): id is number => id !== undefined)
        : [];

      charDef.setCharacterCategory(start, end, classId, [
        classId,
        ...compatClasses,
      ]);
    }
  }

  return {
    categoryMap: charDef.getCategoryMap(),
    compatMap: charDef.getCompatibleCategoryMap(),
    invokeBuf: charDef.toInvokeBuffer(),
    charDef,
  };
}

async function parseUnkDef(
  path: string,
  charDef: CharacterDefinition
): Promise<{ unkBuf: Uint8Array; unkPosBuf: Uint8Array; unkMapBuf: Uint8Array }> {
  const raw = await readFile(path);
  const text = decodeAutoDetect(new Uint8Array(raw));
  const lines = splitLines(text.trim());

  const unkBuffer = new ByteBuffer(1024 * 64);
  const unkMapEntries: number[] = [];
  const classWordIds: number[][] = charDef
    .getCharacterClasses()
    .map(() => []);

  for (const line of lines) {
    if (line.trim() === "" || line.startsWith("#")) continue;
    const parts = parseCsvLine(line);
    if (parts.length < 5) continue;

    // Format: className,leftId,rightId,cost,features...
    const className = parts[0];
    const leftId = parseInt(parts[1], 10);
    const rightId = parseInt(parts[2], 10);
    const cost = parseInt(parts[3], 10);
    const features = parts.slice(4).join(",");

    const wordId = unkMapEntries.length;
    const pos = unkBuffer.getPosition();
    unkMapEntries.push(pos);
    const classId = charDef
      .getCharacterClasses()
      .findIndex((charClass) => charClass.name === className);
    if (classId >= 0) {
      classWordIds[classId].push(wordId);
    }

    unkBuffer.putInt16(leftId);
    unkBuffer.putInt16(rightId);
    unkBuffer.putInt16(cost);
    unkBuffer.putInt16(features.length);
    unkBuffer.putString(features);
  }

  // Build map buffer
  const mapBuf = new ByteBuffer(4 + unkMapEntries.length * 4);
  mapBuf.putInt32(unkMapEntries.length);
  for (const pos of unkMapEntries) {
    mapBuf.putInt32(pos);
  }

  return {
    unkBuf: unkBuffer.shrink(),
    unkPosBuf: buildUnknownClassBuffer(classWordIds),
    unkMapBuf: mapBuf.shrink(),
  };
}

function buildWordIdGroupBuffer(
  groups: { firstWordId: number; count: number }[]
): Uint8Array {
  const buf = new ByteBuffer(4 + groups.length * 8);
  buf.putInt32(groups.length);
  for (const group of groups) {
    buf.putInt32(group.firstWordId);
    buf.putInt32(group.count);
  }
  return buf.shrink();
}

function buildUnknownClassBuffer(classWordIds: number[][]): Uint8Array {
  const size =
    4 +
    classWordIds.reduce((total, wordIds) => total + 4 + wordIds.length * 4, 0);
  const buf = new ByteBuffer(size);
  buf.putInt32(classWordIds.length);
  for (const wordIds of classWordIds) {
    buf.putInt32(wordIds.length);
    for (const wordId of wordIds) {
      buf.putInt32(wordId);
    }
  }
  return buf.shrink();
}

async function writeGzipped(path: string, data: Uint8Array): Promise<void> {
  const compressed = gzipSync(data);
  await writeFile(path, compressed);
}
