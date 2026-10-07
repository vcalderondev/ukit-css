"use strict"

/**
 * Hover content for a ukit class name.
 *
 * Pure module: text + caret offset in, markdown lines out. extension.js wraps
 * the result in a vscode.Hover.
 *
 * Everything shown comes from the engine's `explainClass()`, so the CSS a
 * developer hovers is byte-for-byte the CSS the build will emit. Unknown
 * classes fall back to `suggestClasses()` — and produce *no* hover at all when
 * the engine has no suggestion, which keeps BEM names and identifiers quiet.
 */

const { tokenAt } = require("./extract.js")
// Reuse the completion markdown so a class looks identical in both widgets.
const { valueDocumentation } = require("./completions.js")

/** Suggestions shown for an unknown class. */
const MAX_SUGGESTIONS = 3

/**
 * @param {string} text    full document text
 * @param {number} offset  caret offset
 * @param {object|null} index grammar index from src/manifest.js
 * @returns {{range:{start:number,end:number}, contents:string[]}|null}
 */
function getHover(text, offset, index) {
  if (!index) return null

  const token = tokenAt(text, offset)
  if (!token || token.text === "") return null

  const name = token.text
  const range = { start: token.start, end: token.end }
  const info = index.explain(name)

  if (info && info.valid) {
    return { range, contents: validContents(name, info) }
  }

  const suggestions = index.suggest(name, MAX_SUGGESTIONS)
  if (!suggestions.length) return null

  return {
    range,
    contents: [
      `**\`${name}\`** is not a valid ukit-css class.`,
      `Did you mean ${suggestions.map((s) => "`" + s + "`").join(", ")}?`,
    ],
  }
}

/** Markdown lines for a class the engine accepts. */
function validContents(name, info) {
  const lines = []

  lines.push(info.familyTitle ? `**\`${name}\`** — ${info.familyTitle}` : `**\`${name}\`**`)

  // The exact emitted rule: the CSS fence is the single most useful thing here.
  if (info.css) lines.push("```css\n" + info.css + "\n```")

  const properties =
    info.declarations && typeof info.declarations === "object" ? Object.keys(info.declarations) : []
  if (properties.length) {
    lines.push(`Properties: ${properties.map((p) => "`" + p + "`").join(", ")}`)
  }

  // Breakpoint / media query, when the class carries a `-m` or `-t` suffix.
  if (info.mediaQuery) {
    lines.push(`Breakpoint \`${info.breakpoint}\` — \`${info.mediaQuery}\``)
  } else {
    lines.push("Breakpoint: base (no media query)")
  }

  // Every utility is emitted with !important except animate-*, which is
  // deliberately overridable. Worth calling out because it changes overrides.
  if (info.important === false) {
    lines.push("_No `!important` — this utility is intentionally overridable._")
  }

  return lines
}

module.exports = { getHover, MAX_SUGGESTIONS }
