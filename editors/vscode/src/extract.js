"use strict"

/**
 * Finds the class-name "regions" of a source file and the individual class
 * tokens inside them.
 *
 * Why this exists: a ukit scan is permissive *about class values*, but the
 * extension must not go warning about every identifier, prose word or file path
 * in a document. So we first locate the places that hold class names and only
 * ever look at tokens inside them.
 *
 * Deliberately text-based, not a parser. The engine's own extractor is
 * framework-agnostic and this follows the same philosophy: a couple of tight
 * regexes plus a quote-aware scan. That keeps it correct for HTML/JSX/Vue/
 * Svelte/Astro/PHP/Twig/Handlebars/Liquid/Markdown alike, and cheap enough to
 * run on every keystroke.
 *
 * Pure module: no `vscode` import, offsets in / offsets out.
 */

/**
 * Attribute / directive names whose value is a class list.
 *
 * Order matters inside the alternation: longer names first, so `className`
 * wins over `class` and `class:list` over `class`.
 */
const ATTRIBUTE_OPEN =
  /(?:^|[^\w:$-])(?::class|v-bind:class|class:list|class:name|className|class|\[class\]|\[ngClass\]|ngClass)\s*=\s*/g

/** JS/TS helper calls that take a class list as a string literal. */
const HELPER_CALL_OPEN = /(?:^|[^\w$.])(?:cn|clsx|classNames|classnames|cx|cva|twMerge)\s*\(\s*/g

const WHITESPACE = /\s/

/** True for characters that may appear in a real ukit class name. */
const CANDIDATE_TOKEN = /^[a-z0-9-]+$/

// ---------------------------------------------------------------------------
// Small text helpers
// ---------------------------------------------------------------------------

function endOfLine(text, index) {
  const newline = text.indexOf("\n", index)
  return newline === -1 ? text.length : newline
}

/** Index of the closing quote of a string starting at `start`, or -1. */
function findClosingQuote(text, start, quote, limit) {
  for (let i = start + 1; i < limit; i++) {
    const ch = text[i]
    if (ch === "\\") {
      i++
      continue
    }
    if (ch === quote) return i
  }
  return -1
}

/**
 * Index of the `}`/`]` matching the `{`/`[` at `start`, skipping over string
 * literals. Returns end-of-line when the block is still open (mid-typing), so
 * an unterminated JSX expression can never swallow the rest of the file.
 */
function findBalancedEnd(text, start, openChar) {
  const closeChar = openChar === "{" ? "}" : "]"
  let depth = 0
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"' || ch === "'" || ch === "`") {
      const close = findClosingQuote(text, i, ch, text.length)
      if (close === -1) return endOfLine(text, start)
      i = close
      continue
    }
    if (ch === openChar) depth++
    else if (ch === closeChar) {
      depth--
      if (depth === 0) return i
    }
  }
  return endOfLine(text, start)
}

function matchAll(text, regex) {
  const out = []
  regex.lastIndex = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    out.push(match)
    if (match.index === regex.lastIndex) regex.lastIndex++ // zero-length guard
  }
  return out
}

// ---------------------------------------------------------------------------
// Regions
// ---------------------------------------------------------------------------

/**
 * Read one class-bearing region starting at `pos` (just past the `=`).
 *
 * Three shapes are recognised:
 *
 *   class="a b"                 quoted class list            -> expression:false
 *   :class="'a b'"              quoted *expression*          -> expression:true
 *   className={"a b"}           braces around a literal      -> expression:true
 *   className={cn("a b")}       braces around an expression  -> expression:true
 *
 * Quoted regions run to the matching quote, which may be on a later line
 * (multi-line class lists are normal). When the quote is missing — the user is
 * mid-typing `class="m-1-re` — the region ends at the current line so we do not
 * treat the rest of the file as class names.
 */
function readRegion(text, pos, expressionAllowed, out) {
  const ch = text[pos]

  if (expressionAllowed && (ch === "{" || ch === "[")) {
    const end = findBalancedEnd(text, pos, ch)
    out.push({ start: pos + 1, end, expression: true })
    return
  }

  if (ch === '"' || ch === "'" || ch === "`") {
    const close = findClosingQuote(text, pos, ch, text.length)
    const end = close === -1 ? endOfLine(text, pos) : close
    out.push({ start: pos + 1, end, expression: false })
  }
  // Anything else (`class=foo`, `[class]=x`) is not a literal class list.
}

/** Merge overlapping regions, keeping the first (outermost, leftmost) one. */
function dedupeRegions(regions) {
  regions.sort((a, b) => a.start - b.start || a.end - b.end)
  const kept = []
  for (const region of regions) {
    if (region.end < region.start) continue
    // `regions` is sorted by start and `kept` is non-overlapping, so a region
    // can only collide with the most recent survivor. This keeps the merge
    // linear: a 1 MB document can produce thousands of regions.
    const last = kept.length ? kept[kept.length - 1] : null
    if (last && region.start < last.end) continue
    kept.push(region)
  }
  return kept
}

/**
 * All class-bearing regions of `text`, sorted and non-overlapping.
 *
 * @param {string} text
 * @returns {Array<{start:number,end:number,expression:boolean}>} offsets
 */
function findClassRegions(text) {
  if (typeof text !== "string" || !text) return []
  const regions = []

  for (const match of matchAll(text, ATTRIBUTE_OPEN)) {
    readRegion(text, match.index + match[0].length, true, regions)
  }
  for (const match of matchAll(text, HELPER_CALL_OPEN)) {
    readRegion(text, match.index + match[0].length, false, regions)
  }

  return dedupeRegions(regions)
}

/**
 * The sub-spans of a region that actually hold class names.
 *
 *   - a class-list attribute (`class="a b"`) is one span;
 *   - a quoted *expression* (`:class="'a b'"`) is reduced to its string
 *     literals, so the surrounding quotes are not part of the tokens;
 *   - a braced expression (`className={"a b"}`, `class:list={["a","b"]}`) is
 *     *only* ever reduced to its string literals — never scanned as a whole —
 *     which is what keeps `:class="{ active: isActive }"` quiet about `active`.
 */
function scanSpans(text, region) {
  if (region.end < region.start) return []
  const content = text.slice(region.start, region.end)

  if (region.expression) return quotedSpans(text, region.start, region.end)

  if (content.includes('"') || content.includes("'") || content.includes("`")) {
    const quoted = quotedSpans(text, region.start, region.end)
    if (quoted.length) return quoted
  }
  return [{ start: region.start, end: region.end }]
}

/** Quoted string literals inside [from, to). */
function quotedSpans(text, from, to) {
  const spans = []
  for (let i = from; i < to; i++) {
    const ch = text[i]
    if (ch !== '"' && ch !== "'" && ch !== "`") continue
    const close = findClosingQuote(text, i, ch, to)
    if (close === -1) {
      spans.push({ start: i + 1, end: to })
      break
    }
    spans.push({ start: i + 1, end: close })
    i = close
  }
  return spans
}

/** Whitespace-delimited tokens of a span, with absolute offsets. */
function tokensInSpan(text, span) {
  const out = []
  const slice = text.slice(span.start, span.end)
  const regex = /\S+/g
  let match
  while ((match = regex.exec(slice)) !== null) {
    out.push({
      start: span.start + match.index,
      end: span.start + match.index + match[0].length,
      text: match[0],
    })
  }
  return out
}

/** Every class token of the document. */
function tokensInDocument(text) {
  const out = []
  for (const region of findClassRegions(text)) {
    for (const span of scanSpans(text, region)) {
      for (const token of tokensInSpan(text, span)) out.push(token)
    }
  }
  return out
}

/**
 * Regions of `text` that can contain `offset`, found by scanning only a window
 * around it.
 *
 * Completions and hover run on every keystroke, so they must not rescan a 1 MB
 * document. A class attribute opening more than 16 KB before the caret (or a
 * helper call more than 4 KB before it) is not a real document, and the fallback
 * to a full scan only happens for small files anyway.
 */
const WINDOW_BACK = 16 * 1024
const WINDOW_FORWARD = 4 * 1024

function findClassRegionsNear(text, offset) {
  const start = Math.max(0, offset - WINDOW_BACK)
  const end = Math.min(text.length, offset + WINDOW_FORWARD)
  if (start === 0 && end === text.length) return findClassRegions(text)

  return findClassRegions(text.slice(start, end)).map((region) => ({
    start: region.start + start,
    end: region.end + start,
    expression: region.expression,
  }))
}

/**
 * The class token that contains `offset`, or null when the caret is not inside
 * a class-bearing region.
 *
 * A caret between two tokens (or right after `class="`) yields an empty token,
 * which is what completions need.
 */
function tokenAt(text, offset) {
  if (typeof text !== "string" || typeof offset !== "number") return null
  if (offset < 0 || offset > text.length) return null

  for (const region of findClassRegionsNear(text, offset)) {
    if (offset < region.start || offset > region.end) continue
    for (const span of scanSpans(text, region)) {
      if (offset < span.start || offset > span.end) continue
      let start = offset
      while (start > span.start && !WHITESPACE.test(text[start - 1])) start--
      let end = offset
      while (end < span.end && !WHITESPACE.test(text[end])) end++
      return { start, end, text: text.slice(start, end) }
    }
  }
  return null
}

/** Cheap gate that can never reject a real class (see selftest invariant). */
function isCandidateToken(token) {
  return (
    typeof token === "string" &&
    token.length > 0 &&
    token.length <= 128 &&
    CANDIDATE_TOKEN.test(token)
  )
}

module.exports = {
  findClassRegions,
  scanSpans,
  tokensInSpan,
  tokensInDocument,
  tokenAt,
  isCandidateToken,
}
