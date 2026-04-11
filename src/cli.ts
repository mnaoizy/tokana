/**
 * CLI entry point for tokana dictionary compiler.
 */

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case "build":
    case "compile": {
      const { compile } = await import("./cli/commands/compile.js");
      await compile(args.slice(1));
      break;
    }
    case "info": {
      const { info } = await import("./cli/commands/info.js");
      await info(args.slice(1));
      break;
    }
    default:
      console.log(`tokana - Modern Japanese Morphological Analyzer

Usage:
  tokana build <source-dir> <output-dir>  Compile MeCab dictionary source
  tokana info <dict-dir>                  Show dictionary info

Options:
  --format <ipadic|unidic|neologd>  Dictionary format (default: ipadic)
`);
      if (command && command !== "help" && command !== "--help") {
        console.error(`Unknown command: ${command}`);
        process.exit(1);
      }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
