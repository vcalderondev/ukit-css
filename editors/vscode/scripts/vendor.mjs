#!/usr/bin/env node
/**
 * Vendors the self-contained ukit engine bundle into the extension.
 *
 *   dist/manifest.cjs  ->  editors/vscode/vendor/manifest.cjs
 *
 * The copy is byte-identical on purpose: that makes "did the vendored engine
 * drift from the built one?" a one-line `shasum`/diff check, and it means the
 * extension can never disagree with the real matchers.
 *
 * Usage (from anywhere):
 *   node editors/vscode/scripts/vendor.mjs
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)

// scripts/ -> editors/vscode -> editors -> repo root
const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, "..", "..", "..")
const source = join(repoRoot, "dist", "manifest.cjs")
const vendorDir = join(repoRoot, "editors", "vscode", "vendor")
const target = join(vendorDir, "manifest.cjs")

function fail(message) {
  console.error(`vendor: FAIL ${message}`)
  process.exit(1)
}

if (!existsSync(source)) {
  fail(
    `missing ${relative(repoRoot, source)} — build the engine first:\n` +
      `  cd "${repoRoot}" && npm run build`,
  )
}

const code = readFileSync(source, "utf8")

// The extension deliberately ships zero dependencies, so the bundle must not
// pull anything in at require() time. Fail loudly instead of shipping a broken
// extension.
const requires = code.match(/\brequire\s*\(/g) || []
if (requires.length > 0) {
  fail(
    `${relative(repoRoot, source)} contains ${requires.length} require() call(s); ` +
      `the vendored engine must be self-contained.`,
  )
}

mkdirSync(vendorDir, { recursive: true })
copyFileSync(source, target)

// Smoke-test the *copy* through exactly the API the extension uses.
let engine
try {
  engine = require(target)
} catch (err) {
  fail(`vendored bundle cannot be required: ${err && err.message}`)
}

const expectedCss = ".m-1-rem {\n  margin: 1rem !important;\n}"
const actual = engine.explainClass("m-1-rem")
if (!actual || actual.css !== expectedCss) {
  fail(
    `vendored engine smoke test failed for explainClass("m-1-rem").css\n` +
      `  expected: ${JSON.stringify(expectedCss)}\n` +
      `  actual:   ${JSON.stringify(actual && actual.css)}`,
  )
}

const manifest = engine.buildManifest()
console.log(`vendor: ${relative(repoRoot, source)} -> ${relative(repoRoot, target)}`)
console.log(
  `vendor: ${statSync(target).size} bytes, ${engine.listClasses(false).length} base / ` +
    `${engine.listClasses(true).length} total classes, engine ${manifest.package}@${manifest.version}`,
)
console.log(`vendor: 0 external require() calls; explainClass("m-1-rem").css verified`)
