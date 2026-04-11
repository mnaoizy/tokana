/**
 * Token type definitions for different dictionary formats.
 */

/** Base token properties common to all formats */
export interface BaseToken {
  /** Word ID in the dictionary */
  wordId: number;
  /** Token type: "KNOWN", "UNKNOWN", "BOS", "EOS" */
  type: TokenType;
  /** Surface form (the actual text) */
  surface: string;
  /** Start position in the input string */
  offset: number;
  /** Length of the surface form */
  length: number;
  /** Cumulative cost from Viterbi */
  cost: number;
}

export type TokenType = "KNOWN" | "UNKNOWN" | "BOS" | "EOS";

/** IPAdic token with detailed grammatical information */
export interface IpadicToken extends BaseToken {
  /** Part-of-speech (品詞) */
  pos: string;
  /** POS detail 1 (品詞細分類1) */
  posDetail1: string;
  /** POS detail 2 (品詞細分類2) */
  posDetail2: string;
  /** POS detail 3 (品詞細分類3) */
  posDetail3: string;
  /** Conjugation type (活用型) */
  conjugationType: string;
  /** Conjugation form (活用形) */
  conjugationForm: string;
  /** Base form (原形) */
  baseForm: string;
  /** Reading (読み) */
  reading: string;
  /** Pronunciation (発音) */
  pronunciation: string;
}

/** UniDic token with more detailed linguistic annotations */
export interface UnidicToken extends BaseToken {
  /** Part-of-speech 1 */
  pos1: string;
  /** Part-of-speech 2 */
  pos2: string;
  /** Part-of-speech 3 */
  pos3: string;
  /** Part-of-speech 4 */
  pos4: string;
  /** Conjugation type (活用型) */
  cType: string;
  /** Conjugation form (活用形) */
  cForm: string;
  /** Lemma reading form (語彙素読み) */
  lForm: string;
  /** Lemma (語彙素) */
  lemma: string;
  /** Orthographic form (書字形) */
  orth: string;
  /** Orthographic base form (書字形出現形) */
  orthBase: string;
  /** Pronunciation (発音形) */
  pron: string;
  /** Pronunciation base form */
  pronBase: string;
  /** Word origin (語種) */
  goshu: string;
  /** Accent type */
  iType: string;
  /** Accent form */
  iForm: string;
  /** Initial sound change type */
  fType: string;
  /** Initial sound change form */
  fForm: string;
}

/** Discriminated union of all token types */
export type Token = IpadicToken | UnidicToken;
