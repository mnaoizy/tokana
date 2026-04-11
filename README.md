# tokana

Modern Japanese morphological analyzer for TypeScript. Works in Node.js and the browser.

- Zero runtime dependencies
- Full TypeScript support with typed tokens per dictionary format
- ESM and CommonJS
- Supports IPAdic, UniDic, and NEologd dictionaries
- Built-in CLI for compiling MeCab-compatible dictionary sources
- Browser support via `fetch` + `DecompressionStream`

## Install

```bash
npm install tokana
```

## Dictionary Setup

tokana requires compiled dictionary files. Use the CLI to compile from MeCab-compatible sources (e.g. [mecab-ipadic](https://taku910.github.io/mecab/)):

```bash
# Download and extract MeCab IPAdic source, then compile:
npx tokana build ./mecab-ipadic-2.7.0-20070801 ./dict
```

This generates `.dat.gz` files in the output directory.

## Usage

### Node.js

```typescript
import { createTokenizer } from "tokana";

const tokenizer = await createTokenizer({
  format: "ipadic",
  dicPath: "./dict",
});

const tokens = tokenizer.tokenize("東京都に住んでいる");

for (const token of tokens) {
  console.log(token.surface, token.pos, token.baseForm, token.reading);
}
// 東京  名詞  東京  トウキョウ
// 都    名詞  都    ト
// に    助詞  に    ニ
// 住ん  動詞  住む  スン
// で    助詞  で    デ
// いる  動詞  いる  イル
```

### Browser

```typescript
import { createTokenizer } from "tokana";

// dicPath is a URL path — serve .dat.gz files from your static assets
const tokenizer = await createTokenizer({
  format: "ipadic",
  dicPath: "/dict",
});

const tokens = tokenizer.tokenize("形態素解析");
```

## Dictionary Formats

| Format | Description | Features |
|--------|-------------|----------|
| `ipadic` | MeCab IPAdic (default) | 9 fields: pos, posDetail1-3, conjugationType/Form, baseForm, reading, pronunciation |
| `unidic` | UniDic | 17 fields: pos1-4, cType/cForm, lemma, orth, pron, goshu, etc. |
| `neologd` | mecab-ipadic-NEologd | Same as ipadic, with added neologisms |

```typescript
// UniDic example
const tokenizer = await createTokenizer({
  format: "unidic",
  dicPath: "./unidic-dict",
});
```

## API

### `createTokenizer(options): Promise<Tokenizer<T>>`

Creates a tokenizer instance. Loads and parses dictionary files asynchronously.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dicPath` | `string` | (required) | Path to compiled dictionary directory |
| `format` | `"ipadic" \| "unidic" \| "neologd"` | `"ipadic"` | Dictionary format |

### `Tokenizer<T>.tokenize(text: string): T[]`

Tokenizes input text into an array of typed token objects.

### Token Types

**`IpadicToken`** (ipadic / neologd):

```typescript
interface IpadicToken {
  surface: string;         // Surface form
  pos: string;             // Part-of-speech
  posDetail1: string;      // POS subcategory 1
  posDetail2: string;      // POS subcategory 2
  posDetail3: string;      // POS subcategory 3
  conjugationType: string; // Conjugation type
  conjugationForm: string; // Conjugation form
  baseForm: string;        // Base form (lemma)
  reading: string;         // Reading
  pronunciation: string;   // Pronunciation
  // + wordId, type, offset, length, cost
}
```

**`UnidicToken`** (unidic):

```typescript
interface UnidicToken {
  surface: string;
  pos1: string;     pos2: string;     pos3: string;    pos4: string;
  cType: string;    cForm: string;
  lForm: string;    lemma: string;
  orth: string;     orthBase: string;
  pron: string;     pronBase: string;
  goshu: string;
  iType: string;    iForm: string;
  fType: string;    fForm: string;
  // + wordId, type, offset, length, cost
}
```

## CLI

```
tokana build <source-dir> <output-dir>   Compile MeCab dictionary source
tokana info <dict-dir>                   Show dictionary info
```

### Compile a dictionary

```bash
npx tokana build ./mecab-ipadic-2.7.0-20070801 ./dict
```

Reads `matrix.def`, `char.def`, `unk.def`, and `*.csv` from the source directory and outputs compiled `.dat.gz` files.

## Demo

A Vite + React demo app is included in [`demo/`](./demo):

```bash
cd demo
npm install
npm run setup-dict   # downloads and compiles mecab-ipadic
npm run dev          # http://localhost:5173
```

## License

[MIT](./LICENSE)
