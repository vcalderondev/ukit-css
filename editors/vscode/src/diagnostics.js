"use strict"

/**
 * Diagnostics for unknown ukit class names, plus the data a Quick Fix needs.
 *
 * Pure module: text in, plain diagnostic descriptors out. extension.js turns
 * them into vscode.Diagnostic objects and a CodeActionProvider turns the
 * `suggestions` payload into the fix.
 *
 * The rule, straight from the product requirement:
 *
 *   warn  <=>  explainClass(token) rejects the token
 *              AND suggestClasses(token) has at least one suggestion
 *
 * An unknown class with no suggestion is *not* reported. That single condition
 * is what keeps BEM names (`p-button__icon`), file paths, template variables
 * and ordinary identifiers quiet — and it is exactly why this module must never
 * invent its own similarity metric: the engine already decides when a name is
 * "close enough" to be a typo.
 *
 * Two guards run before the engine, both strictly narrowing:
 *   - tokens are only collected inside class-bearing regions (src/extract.js);
 *   - tokens must look like a class name at all (`[a-z0-9-]+`, length >= 3).
 *
 * The length floor is a UX choice: `p`, `mt`, `w`, `h1` are normally a stem the
 * user is halfway through typing, and the engine's nearest suggestion for them
 * ("mt -> m-0") is misleading rather than helpful.
 */

const { tokensInDocument, isCandidateToken } = require("./extract.js")

const SOURCE = "ukit-css"
const SEVERITY = "warning"

/** Tokens shorter than this are assumed to be in-progress typing. */
const MIN_TOKEN_LENGTH = 3

/** Upper bound per document, so a generated/minified file cannot flood the UI. */
const MAX_DIAGNOSTICS = 200

/**
 * @param {string} text
 * @param {object|null} index grammar index from src/manifest.js
 * @param {{minTokenLength?:number, maxDiagnostics?:number}} [options]
 * @returns {Array<{start:number,end:number,token:string,message:string,
 *                  suggestions:string[],severity:string,source:string}>}
 */
function getDiagnostics(text, index, options) {
  if (!index || typeof text !== "string" || !text) return []

  const minTokenLength = numberOr(options && options.minTokenLength, MIN_TOKEN_LENGTH)
  const maxDiagnostics = numberOr(options && options.maxDiagnostics, MAX_DIAGNOSTICS)

  const out = []
  const seen = new Set()

  for (const token of tokensInDocument(text)) {
    if (out.length >= maxDiagnostics) break
    if (token.text.length < minTokenLength) continue
    if (!isCandidateToken(token.text)) continue
    // Report the same typo once per document, not once per occurrence.
    if (seen.has(token.text)) continue

    const info = index.explain(token.text)
    if (info && info.valid) continue

    const suggestions = index.suggest(token.text)
    if (!suggestions.length) continue // <- the rule that keeps non-classes quiet

    seen.add(token.text)
    out.push({
      start: token.start,
      end: token.end,
      token: token.text,
      message: `Unknown ukit-css class "${token.text}". Did you mean "${suggestions[0]}"?`,
      suggestions,
      severity: SEVERITY,
      source: SOURCE,
    })
  }

  return out
}

function numberOr(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

module.exports = {
  getDiagnostics,
  isCandidateToken,
  SOURCE,
  SEVERITY,
  MIN_TOKEN_LENGTH,
  MAX_DIAGNOSTICS,
}
