// =============================================================================
// TS RESOLVE HOOK
// -----------------------------------------------------------------------------
// The source tree uses TypeScript's NodeNext convention: a file `foo.ts` is
// imported as `./foo.js`. Node's built-in type stripping erases the types, but
// it does NOT rewrite that specifier, so `import "./foo.js"` fails when the
// only file on disk is `foo.ts`.
//
// This loader hook rewrites `./foo.js` -> `./foo.ts` when the `.ts` file
// actually exists, which lets build scripts import the TypeScript sources
// directly — no compile step, no chicken-and-egg between `tsup` and the
// artifact generator.
//
// Registered from scripts/generate.mjs via `module.register()`.
// =============================================================================

import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

/** @type {import("node:module").ResolveHook} */
export async function resolve(specifier, context, nextResolve) {
  const isRelative = specifier.startsWith("./") || specifier.startsWith("../")
  if (isRelative && specifier.endsWith(".js") && context.parentURL) {
    const candidate = new URL(specifier, context.parentURL)
    const tsUrl = new URL(candidate.href.replace(/\.js$/, ".ts"))
    if (existsSync(fileURLToPath(tsUrl))) {
      return nextResolve(tsUrl.href, context)
    }
  }
  return nextResolve(specifier, context)
}
