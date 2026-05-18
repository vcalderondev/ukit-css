import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    engine: "src/engine.ts",
    postcss: "src/postcss.ts",
    vite: "src/vite.ts",
    cli: "src/cli.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: false,
  splitting: false,
  target: "node18",
  outDir: "dist",
  shims: false,
  treeshake: true,
})
