/**
 * Dictionary-related type definitions.
 */

/** Character class definition entry */
export interface CharacterClass {
  /** Class name (e.g., DEFAULT, SPACE, KANJI) */
  name: string;
  /** Whether to invoke unknown word processing */
  invoke: boolean;
  /** Whether to group consecutive same-class chars */
  group: boolean;
  /** Maximum unknown word length (0 = unlimited) */
  length: number;
}

/** Character-to-class mapping */
export interface CharacterMapping {
  /** Character class index */
  classId: number;
  /** Compatible classes */
  compatibleClasses: number[];
}

/** Unknown word dictionary entry */
export interface UnknownEntry {
  /** Character class name */
  className: string;
  /** Left context ID */
  leftId: number;
  /** Right context ID */
  rightId: number;
  /** Word cost */
  cost: number;
  /** Token info features */
  features: string[];
}

/** Dictionary file names */
export const DICT_FILES = {
  trie: "base.dat.gz",
  tid: "tid.dat.gz",
  tidPos: "tid_pos.dat.gz",
  tidMap: "tid_map.dat.gz",
  cc: "cc.dat.gz",
  unk: "unk.dat.gz",
  unkPos: "unk_pos.dat.gz",
  unkMap: "unk_map.dat.gz",
  unkChar: "unk_char.dat.gz",
  unkCompat: "unk_compat.dat.gz",
  unkInvoke: "unk_invoke.dat.gz",
} as const;
