#!/usr/bin/env node
// =============================================================================
// VENDOR DRIFT CHECK
// -----------------------------------------------------------------------------
// The VS Code extension ships a copy of the engine so it stays self-contained
// and can never disagree with the real matchers:
//
//   dist/manifest.cjs  ->  editors/vscode/vendor/manifest.cjs
//
// That contract is only useful if the copy is kept in sync, and the copy lives
// outside `dist`, so `npm run generate:check` cannot see it. This check closes
// the gap: run it after `npm run build` in CI.
//
// Usage:
//   node scripts/check-vendor.mjs
// =============================================================================

import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const source = path.join(root, "dist", "manifest.cjs")
const vendored = path.join(root, "editors", "vscode", "vendor", "manifest.cjs")
const rel = (p) => path.relative(root, p)

if (!existsSync(source)) {
  console.error(`✗ ${rel(source)} is missing — run \`npm run build\` first.`)
  process.exit(1)
}

if (!existsSync(vendored)) {
  console.error(
    `✗ ${rel(vendored)} is missing — run \`npm run vendor\` to copy the engine into the extension.`,
  )
  process.exit(1)
}

const a = readFileSync(source)
const b = readFileSync(vendored)

if (!a.equals(b)) {
  console.error(
    `✗ ${rel(vendored)} is out of date (${b.length} bytes) compared with ${rel(source)} (${a.length} bytes).`,
  )
  console.error("  The VS Code extension would disagree with the engine. Fix it with:")
  console.error("    npm run vendor")
  process.exit(1)
}

console.log(`✓ the extension's vendored engine matches ${rel(source)} (${a.length} bytes)`)
