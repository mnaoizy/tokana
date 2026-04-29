import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/browser.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "es2022",
    splitting: false,
  },
  {
    entry: ["src/cli.ts"],
    format: ["esm"],
    sourcemap: true,
    target: "es2022",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
