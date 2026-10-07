"use strict"

/**
 * Completion logic for ukit class names.
 *
 * Pure module: takes plain text + a caret offset, returns plain objects. The
 * `vscode` plumbing (CompletionItem construction, ranges, kinds) lives in
 * extension.js.
 *
 * Cost model — this runs on every keystroke, so:
 *   - the grammar index is built once by src/manifest.js;
 *   - per-stem value labels are stored once on the index and only wrapped here;
 *   - `explainClass` is only called for the (single) token under the caret, and
 *     its markdown documentation is memoised per index.
 *
 * Filtering is delegated to VS Code: every emitted item's `range` covers the
 * whole token, so VS Code fuzzy-matches the typed prefix against the label and
 * ranks the 4k-class vocabulary itself. That is both faster and better feeling
 * than pre-filtering in JavaScript.
 */

const { tokenAt } = require("./extract.js")

/** Hard safety cap so a pathological index can never stall the UI. */
const MAX_ITEMS = 5000

/** sortText prefixes: responsive variants first, then bare classes, stems, values. */
const SORT = { variant: "1", bare: "2", stem: "3", value: "4" }

/** Memoised `explainClass` markdown, per index instance. */
const valueDocs = new WeakMap()

// ---------------------------------------------------------------------------
// Item factories (plain data — see extension.js for the vscode mapping)
// ---------------------------------------------------------------------------

function stemItem(stem, range) {
  return {
    label: stem.stem,
    insertText: stem.stem + "-",
    kind: "stem",
    detail: stem.detail,
    documentation: stem.documentation,
    sortText: SORT.stem + stem.stem,
    range,
  }
}

function bareItem(bare, range) {
  return {
    label: bare.name,
    insertText: bare.name,
    kind: "bare",
    detail: bare.detail,
    documentation: bare.documentation,
    sortText: SORT.bare + bare.name,
    range,
  }
}

function valueItem(index, stem, value, range, relation) {
  const label = stem.stem + "-" + value
  return {
    label,
    insertText: label,
    kind: "value",
    // Prefer the stem's own target ("margin-top") over the family-wide list
    // ("margin, padding, gap"), which is what tells `mt-` apart from `m-`.
    detail:
      stem.targets || (stem.cssProperties.length ? stem.cssProperties.join(", ") : stem.detail),
    documentation: valueDocumentation(index, label),
    // Exact stem matches rank above stems that merely prefix-match the token.
    sortText: (relation === 2 ? SORT.value : "5") + label,
    range,
  }
}

function variantItem(index, variant, range) {
  const info = index.explain(variant.name)
  return {
    label: variant.name,
    insertText: variant.name,
    kind: "variant",
    detail:
      info && info.familyTitle ? `${info.familyTitle} — ${variant.mediaQuery}` : variant.mediaQuery,
    documentation: valueDocumentation(index, variant.name),
    sortText: SORT.variant + variant.name,
    range,
  }
}

/** Markdown for one concrete class, computed at most once per index. */
function valueDocumentation(index, className) {
  let cache = valueDocs.get(index)
  if (!cache) {
    cache = new Map()
    valueDocs.set(index, cache)
  }
  if (cache.has(className)) return cache.get(className)

  const info = index.explain(className)
  const parts = []
  if (info && info.valid) {
    parts.push(
      info.familyTitle ? `**\`${className}\`** — ${info.familyTitle}` : `**\`${className}\`**`,
    )
    if (info.css) parts.push("```css\n" + info.css + "\n```")
    if (info.mediaQuery) parts.push(info.mediaQuery)
  }
  const doc = parts.join("\n\n")
  cache.set(className, doc)
  return doc
}

// ---------------------------------------------------------------------------
// Stem matching
// ---------------------------------------------------------------------------

/**
 * How a typed token relates to a stem name.
 *
 *   2 — the token *is* the stem, or starts with `stem-`  (`m-`, `m-1-re`)
 *   1 — the token is a prefix of `stem-`                 (`m` also brings `mt-`)
 *   0 — unrelated
 *
 * Relation 1 is what makes a bare `m` surface `mt-`, `mx-`, `max-w-` too;
 * VS Code's fuzzy filter discards whichever the user did not mean.
 */
function stemRelation(token, stemName) {
  if (token === stemName || token.startsWith(stemName + "-")) return 2
  if ((stemName + "-").startsWith(token)) return 1
  return 0
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * @param {string} text      full document text
 * @param {number} offset    caret offset (UTF-16 code units, as vscode reports)
 * @param {object|null} index grammar index from src/manifest.js
 * @returns {Array<object>} plain completion items, possibly empty
 */
function getCompletions(text, offset, index) {
  if (!index) return []

  const token = tokenAt(text, offset)
  if (!token) return []

  const range = { start: token.start, end: token.end }
  const value = token.text

  // Empty token (fresh attribute, or caret after a space): offer the whole
  // vocabulary surface — every stem plus the bare classes that take no value.
  if (value === "") {
    const items = []
    for (const stem of index.stems) items.push(stemItem(stem, range))
    for (const bare of index.bare) items.push(bareItem(bare, range))
    return items
  }

  const items = []

  // stem + value for every matching stem.
  for (const stem of index.stems) {
    const relation = stemRelation(value, stem.stem)
    if (!relation) continue
    for (const stemValue of stem.values) {
      items.push(valueItem(index, stem, stemValue, range, relation))
      if (items.length >= MAX_ITEMS) return items
    }
  }

  // Bare classes are full class names, so only prefix matches are useful.
  for (const bare of index.bare) {
    if (!bare.name.startsWith(value)) continue
    items.push(bareItem(bare, range))
  }

  // A complete, valid base class also unlocks its responsive variants.
  for (const variant of index.variantsFor(value)) {
    items.push(variantItem(index, variant, range))
  }

  return items
}

module.exports = { getCompletions, stemRelation, valueDocumentation, MAX_ITEMS }
