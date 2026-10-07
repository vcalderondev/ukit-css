#!/usr/bin/env node
/**
 * Node-based self-test for the ukit-css VS Code extension.
 *
 *   node editors/vscode/test/selftest.mjs
 *
 * Runs anywhere (paths are resolved from this file) and needs no VS Code and no
 * dependencies: every module under test takes plain data in and returns plain
 * data out, with extension.js holding the only `vscode` import.
 *
 * Exits non-zero if any assertion fails.
 */

import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const extRoot = resolve(here, "..")
const repoRoot = resolve(extRoot, "..", "..")

const manifest = require(join(extRoot, "src", "manifest.js"))
const extract = require(join(extRoot, "src", "extract.js"))
const completions = require(join(extRoot, "src", "completions.js"))
const hover = require(join(extRoot, "src", "hover.js"))
const diagnostics = require(join(extRoot, "src", "diagnostics.js"))
const engine = require(join(extRoot, "vendor", "manifest.cjs"))

// ---------------------------------------------------------------------------
// Tiny test harness
// ---------------------------------------------------------------------------

let passed = 0
const failures = []
let group = ""

function describe(name) {
  group = name
  console.log(`\n${name}`)
}

function test(name, fn) {
  try {
    fn()
    passed++
    console.log(`  ok    ${name}`)
  } catch (error) {
    failures.push({ group, name, error })
    console.log(`  FAIL  ${name}`)
    console.log(`        ${error && error.message}`)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "expected a truthy value")
}

function eq(actual, expected, message) {
  const a = JSON.stringify(actual)
  const b = JSON.stringify(expected)
  if (a !== b)
    throw new Error(`${message || "values differ"}\n        actual:   ${a}\n        expected: ${b}`)
}

function includes(haystack, needle, message) {
  if (!haystack.includes(needle)) {
    throw new Error(
      `${message || "value not found"}: ${JSON.stringify(needle)} in ${JSON.stringify(haystack)}`,
    )
  }
}

/** Split a test source on its `|` caret marker into {text, offset}. */
function caret(source) {
  const offset = source.indexOf("|")
  if (offset === -1) throw new Error("test source is missing the | caret marker")
  return { text: source.slice(0, offset) + source.slice(offset + 1), offset }
}

function labels(items) {
  return items.map((item) => item.label)
}

// ---------------------------------------------------------------------------
// Grammar index
// ---------------------------------------------------------------------------

describe("grammar index (src/manifest.js)")

const index = manifest.getIndex()

test("the vendored engine emits the exact CSS for `m-1-rem`", () => {
  const info = engine.explainClass("m-1-rem")
  eq(info.css, ".m-1-rem {\n  margin: 1rem !important;\n}", "explainClass('m-1-rem').css")
  eq(info.valid, true, "m-1-rem must be valid")
})

test("the vendored engine's breakpoint media query is as documented", () => {
  eq(
    engine.explainClass("d-none-m").mediaQuery,
    "@media (max-width: 576px)",
    "d-none-m media query",
  )
  eq(
    engine.listClasses(true).length,
    engine.buildManifest().counts.withBreakpoints,
    "listClasses(true) length",
  )
})

test("the grammar index builds from the vendored engine", () => {
  assert(index, "getIndex() returned null — is vendor/manifest.cjs present? run scripts/vendor.mjs")
  assert(index.stems.length >= 50, `expected a large stem vocabulary, got ${index.stems.length}`)
  assert(index.bare.length > 0, "expected bare classes to be indexed")
  eq(
    index.breakpoints.suffixes.map((s) => s.suffix),
    ["-m", "-t"],
    "breakpoint suffixes",
  )
  assert(index.aliases.get("text-sm"), "tailwindAliases should be indexed")
  eq(index.aliases.get("text-sm"), ["fs-0-875-rem"], "text-sm alias")
})

test("every stem has values plus documentation, every bare class too", () => {
  for (const stem of index.stems) {
    assert(stem.values.length > 0, `stem ${stem.stem} has no values`)
    assert(
      typeof stem.documentation === "string" && stem.documentation.length > 0,
      `stem ${stem.stem} docs`,
    )
    assert(stem.documentation.includes(stem.stem), `stem ${stem.stem} docs mention the stem`)
  }
  for (const bare of index.bare) {
    assert(
      typeof bare.documentation === "string" && bare.documentation.length > 0,
      `bare ${bare.name} docs`,
    )
  }
})

test("stems are merged across families when the same stem is declared twice", () => {
  const w = index.stemsByName.get("w")
  assert(w, "expected a `w` stem")
  assert(
    w.families.length >= 2,
    `expected \`w\` to be merged from several families, got ${w.families.length}`,
  )
})

test("stem values + bare classes account for every base class in the manifest", () => {
  const uniqueValues = index.stems.reduce((total, stem) => total + stem.values.length, 0)
  const base = index.counts.base
  assert(typeof base === "number", "manifest counts.base is missing")
  eq(uniqueValues + index.bare.length, base, "vocabulary partition")
})

test("variantsFor respects base-ness and the shadowed `border` + `-t` exception", () => {
  eq(
    index.variantsFor("m-1-rem").map((v) => v.name),
    ["m-1-rem-m", "m-1-rem-t"],
    "m-1-rem variants",
  )
  eq(index.variantsFor("d-none-m"), [], "a breakpoint class has no further variants")
  eq(
    index.variantsFor("border").map((v) => v.name),
    ["border-m"],
    "`border` must not offer the shadowed -t",
  )
  eq(
    index.variantsFor("d-none").map((v) => v.name),
    ["d-none-m", "d-none-t"],
    "d-none variants",
  )
})

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

describe("class-region extraction (src/extract.js)")

test("finds class and className attributes", () => {
  const text = '<div class="m-1-rem p-4" className="d-flex"></div>'
  eq(
    extract.tokensInDocument(text).map((t) => t.text),
    ["m-1-rem", "p-4", "d-flex"],
    "tokens",
  )
})

test("completes inside an attribute that is still being typed", () => {
  const { text, offset } = caret('<div class="m-1-re|')
  eq(extract.tokenAt(text, offset).text, "m-1-re", "unterminated attribute token")
})

test("understands Vue, Svelte and Astro class directives", () => {
  eq(
    extract.tokensInDocument("<div :class=\"'m-1-rem d-flex'\"></div>").map((t) => t.text),
    ["m-1-rem", "d-flex"],
  )
  eq(
    extract.tokensInDocument("<div v-bind:class=\"'m-1-rem'\"></div>").map((t) => t.text),
    ["m-1-rem"],
  )
  eq(
    extract.tokensInDocument('<div class:list={["m-1-rem", "p-4"]}></div>').map((t) => t.text),
    ["m-1-rem", "p-4"],
  )
})

test("finds JSX brace expressions and quoted helper calls", () => {
  eq(
    extract.tokensInDocument('<div className={"m-1-rem p-4"} />').map((t) => t.text),
    ["m-1-rem", "p-4"],
  )
  eq(
    extract.tokensInDocument('cn("m-1-rem p-4")').map((t) => t.text),
    ["m-1-rem", "p-4"],
  )
})

test("expression regions expose only their string literals", () => {
  const text = "<div :class=\"{ 'm-1-rem': isActive, absolute: other }\"></div>"
  eq(
    extract.tokensInDocument(text).map((t) => t.text),
    ["m-1-rem"],
    "only the quoted class is a token",
  )

  const jsx = '<div className={active ? "d-flex" : someVariable} />'
  eq(
    extract.tokensInDocument(jsx).map((t) => t.text),
    ["d-flex"],
    "JSX conditional",
  )
})

test("tokenAt returns null outside class-bearing regions", () => {
  const text = "<p>d-flx is mentioned in prose</p>"
  eq(extract.tokenAt(text, text.indexOf("d-flx")), null, "prose must not be a token")
  const { text: open, offset } = caret('<div class="|"></div>')
  const token = extract.tokenAt(open, offset)
  assert(token, "expected an empty token right after the opening quote")
  eq(token.text, "", "empty token text")
})

// ---------------------------------------------------------------------------
// Completions
// ---------------------------------------------------------------------------

describe("completions (src/completions.js)")

test("an empty token returns the full stem list plus bare classes", () => {
  const { text, offset } = caret('<div class="|"></div>')
  const items = completions.getCompletions(text, offset, index)
  const found = new Set(labels(items))

  for (const stem of index.stems) {
    assert(found.has(stem.stem), `stem \`${stem.stem}\` missing from the completion list`)
  }
  for (const bare of index.bare) {
    assert(found.has(bare.name), `bare class \`${bare.name}\` missing from the completion list`)
  }
  const stemItem = items.find((item) => item.label === "m")
  eq(stemItem.kind, "stem", "stem item kind")
  includes(stemItem.detail, "Spacing", "stem detail is the family title")
  eq(stemItem.range, { start: offset, end: offset }, "empty token range is the caret")
})

test('completions for "m-" include m-1-rem and m-16px', () => {
  const { text, offset } = caret('<div class="m-|"></div>')
  const items = completions.getCompletions(text, offset, index)
  const found = new Set(labels(items))
  assert(found.has("m-1-rem"), "m-1-rem missing")
  assert(found.has("m-16px"), "m-16px missing")
  assert(found.has("m-auto"), "m-auto missing")

  const item = items.find((candidate) => candidate.label === "m-1-rem")
  eq(item.kind, "value", "value item kind")
  eq(item.range, { start: offset - 2, end: offset }, "range covers the typed token")
  includes(item.detail, "margin", "detail carries the CSS properties")
  eq(item.detail, "margin", "the m- stem reports its own target, not the whole family")

  // Sibling stems must be distinguishable in the completion list: telling the
  // user "margin, padding, gap" for `mt-` is useless when choosing a stem.
  const mt = caret('<div class="mt-|"></div>')
  const mtItem = completions
    .getCompletions(mt.text, mt.offset, index)
    .find((candidate) => candidate.label === "mt-16px")
  eq(mtItem.detail, "margin-top", "the mt- stem reports margin-top")
  includes(mtItem.documentation, "margin-top", "stem docs mention the target")
})

test('completions for "grid-cols-" include grid-cols-3', () => {
  const { text, offset } = caret('<div class="grid-cols-|"></div>')
  const found = new Set(labels(completions.getCompletions(text, offset, index)))
  assert(found.has("grid-cols-3"), "grid-cols-3 missing")
  assert(found.has("grid-cols-12"), "grid-cols-12 missing")
})

test("completions after a valid base class include the -m and -t variants", () => {
  const { text, offset } = caret('<div class="d-none|"></div>')
  const items = completions.getCompletions(text, offset, index)
  const variants = items.filter((item) => item.kind === "variant")
  const names = labels(variants)
  assert(names.includes("d-none-m"), `d-none-m missing (got ${JSON.stringify(names)})`)
  assert(names.includes("d-none-t"), `d-none-t missing (got ${JSON.stringify(names)})`)
  includes(
    variants.find((v) => v.label === "d-none-m").detail,
    "@media (max-width: 576px)",
    "variant detail",
  )
})

test("the `border` + `-t` exception is respected, without losing the bare class", () => {
  const { text, offset } = caret('<div class="border|"></div>')
  const items = completions.getCompletions(text, offset, index)
  const variants = labels(items.filter((item) => item.kind === "variant"))
  eq(variants, ["border-m"], "border must only offer the -m variant")
  assert(labels(items).includes("border-t"), "the bare class `border-t` should still be offered")
})

test("value items document the CSS that will be emitted", () => {
  const { text, offset } = caret('<div class="m-|"></div>')
  const items = completions.getCompletions(text, offset, index)
  const item = items.find((candidate) => candidate.label === "m-1-rem")
  includes(item.documentation, "margin: 1rem !important", "documentation should show the CSS")
  assert(item.sortText, "value items carry a sortText")
})

test("completions are quiet outside class values", () => {
  const prose = "const total = items.length;"
  eq(completions.getCompletions(prose, 10, index), [], "prose yields no completions")
  eq(completions.getCompletions("", 0, index), [], "empty document yields no completions")
})

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

describe("diagnostics (src/diagnostics.js)")

test('"d-flx" produces a warning diagnostic with d-flex as the suggested fix', () => {
  const text = '<div class="d-flx"></div>'
  const found = diagnostics.getDiagnostics(text, index)
  eq(found.length, 1, "exactly one diagnostic")
  const [entry] = found
  eq(entry.token, "d-flx", "token")
  eq(entry.severity, "warning", "severity")
  eq(entry.source, "ukit-css", "source")
  eq(entry.suggestions[0], "d-flex", "best suggestion")
  eq(text.slice(entry.start, entry.end), "d-flx", "the range must cover exactly the token")
  includes(entry.message, "d-flex", "message mentions the fix")
})

test('the BEM name "p-button__icon" produces no diagnostic', () => {
  eq(
    diagnostics.getDiagnostics('<div class="p-button__icon"></div>', index),
    [],
    "BEM names stay quiet",
  )
})

test("identifiers, paths and unknown names without suggestions stay quiet", () => {
  const text = [
    '<div class="wrapper container btn card my-custom-thing"></div>',
    '<div :class="{ active: isActive, absolute: other }"></div>',
    'import styles from "./my-file.module.css"',
    "const flexDirection = compute();",
  ].join("\n")
  eq(diagnostics.getDiagnostics(text, index), [], "no false positives")
})

test("repeated typos are reported once and prose is ignored", () => {
  const repeated = '<div class="d-flx"></div><span class="d-flx"></span>'
  eq(diagnostics.getDiagnostics(repeated, index).length, 1, "deduplicated per document")

  const prose = "<p>d-flx is only mentioned in prose here</p>"
  eq(diagnostics.getDiagnostics(prose, index), [], "prose is not scanned")
})

test("short in-progress tokens are not reported", () => {
  eq(diagnostics.getDiagnostics('<div class="mt"></div>', index), [], "`mt` is a stem mid-typing")
  eq(diagnostics.getDiagnostics('<div class="m"></div>', index), [], "`m` is a stem mid-typing")
})

test("diagnostics are off, and empty, when the index is unavailable", () => {
  eq(diagnostics.getDiagnostics("", index), [], "empty text")
  eq(
    diagnostics.getDiagnostics('<div class="d-flx"></div>', null),
    [],
    "no index => no diagnostics",
  )
})

// ---------------------------------------------------------------------------
// Hover
// ---------------------------------------------------------------------------

describe("hover (src/hover.js)")

test("hover on m-1-rem returns the emitted CSS", () => {
  const { text, offset } = caret('<div class="m-1-|rem"></div>')
  const result = hover.getHover(text, offset, index)
  assert(result, "expected hover content")
  const body = result.contents.join("\n\n")
  includes(body, ".m-1-rem {\n  margin: 1rem !important;\n}", "exact CSS")
  includes(body, "Spacing", "family title")
  includes(body, "base (no media query)", "breakpoint note")
  eq(text.slice(result.range.start, result.range.end), "m-1-rem", "hover range covers the token")
})

test("hover on grid-cols-3 mentions its CSS properties", () => {
  const { text, offset } = caret('<div class="grid-|cols-3"></div>')
  const result = hover.getHover(text, offset, index)
  assert(result, "expected hover content")
  const body = result.contents.join("\n\n")
  includes(body, "grid-template-columns", "grid-template-columns property")
  includes(body, "display", "display property")
  includes(body, "repeat(3, minmax(0, 1fr))", "generated value")
})

test("hover on a breakpoint class shows the media query", () => {
  const { text, offset } = caret('<div class="d-none-|m"></div>')
  const body = hover.getHover(text, offset, index).contents.join("\n\n")
  includes(body, "@media (max-width: 576px)", "media query")
  includes(body, "Breakpoint `mobile`", "breakpoint id")
})

test("hover on an unknown class suggests the closest valid class", () => {
  const { text, offset } = caret('<div class="d-fl|_x"></div>')
  const result = hover.getHover(text, offset, index)
  assert(result, "expected hover content for an unknown class")
  const body = result.contents.join("\n\n")
  includes(body, "not a valid ukit-css class", "unknown marker")
  includes(body, "d-flex", "suggestion")
})

test("hover on an unknown class with no suggestion returns null", () => {
  const { text, offset } = caret('<div class="p-button_|_icon"></div>')
  eq(hover.getHover(text, offset, index), null, "no hover for an unknown non-class")
  eq(hover.getHover("<p>d-flx</p>", 4, index), null, "no hover outside class regions")
})

test("animate-* is documented as overridable (no !important)", () => {
  const { text, offset } = caret('<div class="animate-|spin"></div>')
  const body = hover.getHover(text, offset, index).contents.join("\n\n")
  includes(body, "animation: spin 1s linear infinite;", "animation CSS")
  includes(body, "intentionally overridable", "no-!important note")
})

// ---------------------------------------------------------------------------
// Robustness
// ---------------------------------------------------------------------------

describe("robustness")

test("engine guards swallow non-string input instead of throwing", () => {
  eq(manifest.explainGuarded(engine, null), null, "null")
  eq(manifest.explainGuarded(engine, undefined), null, "undefined")
  eq(manifest.explainGuarded(engine, 123), null, "number")
  eq(manifest.suggestGuarded(engine, {}, 3), [], "object")
  eq(manifest.suggestGuarded(engine, [], 3), [], "array")
  assert(manifest.explainGuarded(engine, "") !== null, "empty strings still reach the engine")
  eq(index.explain(null), null, "index.explain guard")
  eq(index.suggest(undefined), [], "index.suggest guard")
  eq(index.variantsFor(null), [], "index.variantsFor guard")
})

test("a missing vendored engine degrades gracefully", () => {
  const realEngine = manifest.getEngine()
  try {
    manifest.__setEngine(null)
    eq(manifest.getIndex(), null, "no index without an engine")
    assert(manifest.getEngineError() instanceof Error, "the failure reason is recorded")

    const { text, offset } = caret('<div class="m-|"></div>')
    eq(completions.getCompletions(text, offset, null), [], "completions degrade to []")
    eq(
      completions.getCompletions(text, offset, manifest.getIndex()),
      [],
      "completions with no index",
    )
    eq(diagnostics.getDiagnostics(text, manifest.getIndex()), [], "diagnostics degrade to []")
    eq(hover.getHover(text, offset, manifest.getIndex()), null, "hover degrades to null")
  } finally {
    manifest.__setEngine(realEngine)
  }
  assert(manifest.getIndex(), "the index is rebuilt after the engine is restored")
})

test("the diagnostics token gate accepts every real class name", () => {
  const all = engine.listClasses(true)
  const rejected = all.filter((name) => !diagnostics.isCandidateToken(name))
  eq(rejected.length, 0, "a valid class must never be filtered out by the charset gate")
  assert(!diagnostics.isCandidateToken("p-button__icon"), "BEM names are filtered out")
  assert(!diagnostics.isCandidateToken("some/file.css"), "paths are filtered out")
})

// ---------------------------------------------------------------------------

console.log(`\n${passed} passed, ${failures.length} failed`)
if (failures.length) {
  console.log("\nFailures:")
  for (const failure of failures) console.log(`  - ${failure.group} :: ${failure.name}`)
  process.exit(1)
}
